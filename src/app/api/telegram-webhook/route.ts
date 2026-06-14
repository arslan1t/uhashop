/**
 * Telegram Bot webhook handler.
 *
 * Handles:
 *   /start SESSION_ID  — links chat to auth session, asks for contact
 *   contact message    — completes auth session, upserts user in Firestore
 *
 * Security: validated via X-Telegram-Bot-Api-Secret-Token header
 * (set when registering webhook via setWebhook API).
 */
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAdminDb, getAdminStorage } from "@/lib/firebase/admin";
import { mintUserToken } from "@/lib/user-auth";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://frontend-designswipe.vercel.app";

// Always return 200 to Telegram — never let errors cause retries
const ok = () => NextResponse.json({ ok: true });

async function tgPost(method: string, body: object) {
  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function sendMessage(chatId: number, text: string, extra?: object) {
  await tgPost("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...extra });
}

/**
 * Best-effort: pull the user's current Telegram profile photo, re-upload it to
 * Firebase Storage (Telegram file URLs require the bot token and rotate), and
 * return a permanent download URL. Returns null if the user hides their photo
 * or anything fails — never throws, never blocks login.
 */
async function fetchTelegramAvatar(userId: string, telegramId: number): Promise<string | null> {
  try {
    const photosRes = await tgPost("getUserProfilePhotos", { user_id: telegramId, limit: 1 });
    const photos = await photosRes.json();
    const sizes = photos?.result?.photos?.[0];
    if (!Array.isArray(sizes) || sizes.length === 0) return null;
    const fileId = sizes[sizes.length - 1]?.file_id; // largest size
    if (!fileId) return null;

    const fileRes = await tgPost("getFile", { file_id: fileId });
    const fileInfo = await fileRes.json();
    const filePath: string | undefined = fileInfo?.result?.file_path;
    if (!filePath) return null;

    const imgRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
    if (!imgRes.ok) return null;
    const buf = Buffer.from(await imgRes.arrayBuffer());

    const token = randomUUID();
    const ext = filePath.split(".").pop()?.toLowerCase() || "jpg";
    const path = `user-uploads/${userId}/tg-avatar-${token}.${ext}`;
    const bucket = getAdminStorage().bucket();
    await bucket.file(path).save(buf, {
      metadata: {
        contentType: "image/jpeg",
        metadata: { firebaseStorageDownloadTokens: token },
      },
    });
    const encoded = encodeURIComponent(path);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encoded}?alt=media&token=${token}`;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // Validate webhook secret if configured
  if (WEBHOOK_SECRET) {
    const incoming = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (incoming !== WEBHOOK_SECRET) return ok();
  }

  try {
    const update = await req.json();
    const msg = update.message;
    if (!msg) return ok();

    const chatId: number = msg.chat.id;
    const from = msg.from ?? {};
    const db = getAdminDb();

    // ── /start SESSION_ID ────────────────────────────────────────────────────
    if (msg.text?.startsWith("/start")) {
      const sessionId = msg.text.split(" ")[1]?.trim() ?? "";

      if (!sessionId) {
        await sendMessage(chatId,
          "Добро пожаловать в <b>UHA SHOP</b>!\n\nДля входа перейдите на сайт и нажмите кнопку «Войти через Telegram».",
          { reply_markup: { remove_keyboard: true } }
        );
        return ok();
      }

      const sessionRef = db.collection("auth_sessions").doc(sessionId);
      const session = await sessionRef.get();

      if (!session.exists) {
        await sendMessage(chatId, "⚠️ Ссылка недействительна. Вернитесь на сайт и попробуйте снова.");
        return ok();
      }

      if (new Date(session.data()!.expiresAt as string) < new Date()) {
        await sendMessage(chatId, "⏱ Время сессии истекло. Вернитесь на сайт и нажмите кнопку снова.");
        return ok();
      }

      // Link this chat to the session
      await sessionRef.update({ status: "waiting_contact", chatId });
      await db.collection("bot_chat_sessions").doc(String(chatId)).set({ sessionId });

      await sendMessage(chatId,
        `👋 Привет, <b>${from.first_name ?? "игрок"}</b>!\n\n` +
        `Для входа в <b>UHA SHOP</b> поделитесь номером телефона — одно нажатие.`,
        {
          reply_markup: {
            keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
      return ok();
    }

    // ── Contact shared ───────────────────────────────────────────────────────
    if (msg.contact) {
      const contact = msg.contact;

      const chatSessionDoc = await db.collection("bot_chat_sessions").doc(String(chatId)).get();
      if (!chatSessionDoc.exists) {
        await sendMessage(chatId, "Сессия не найдена. Вернитесь на сайт и начните заново.",
          { reply_markup: { remove_keyboard: true } }
        );
        return ok();
      }

      const { sessionId } = chatSessionDoc.data()!;
      const sessionRef = db.collection("auth_sessions").doc(sessionId);
      const session = await sessionRef.get();

      if (!session.exists || new Date(session.data()!.expiresAt as string) < new Date()) {
        await sendMessage(chatId, "⏱ Время сессии истекло. Вернитесь на сайт и начните заново.",
          { reply_markup: { remove_keyboard: true } }
        );
        return ok();
      }

      const sessionData = session.data()!;

      // ── Resolve which account this Telegram identity maps to ──────────────
      // Priority:
      //   1. linkUserId on the session → user is linking TG to an existing
      //      (email) account from a logged-in session. Persist the mapping.
      //   2. existing telegram_links/<tgId> → this TG was linked before; reuse
      //      that account (so email users keep one profile across devices).
      //   3. tg_<id> → plain Telegram-only account.
      const linkRef = db.collection("telegram_links").doc(String(from.id));
      const linkDoc = await linkRef.get();
      let userId: string;
      if (sessionData.linkUserId) {
        userId = sessionData.linkUserId as string;
        await linkRef.set({ userId, telegramId: from.id, linkedAt: new Date().toISOString() }, { merge: true });
      } else if (linkDoc.exists && linkDoc.data()?.userId) {
        userId = linkDoc.data()!.userId as string;
      } else {
        userId = `tg_${from.id}`;
        // Record the mapping so future logins are stable even before any linking.
        await linkRef.set({ userId, telegramId: from.id, linkedAt: new Date().toISOString() }, { merge: true });
      }

      const name = [from.first_name, from.last_name].filter(Boolean).join(" ") || "Пользователь";

      const existingDoc = await db.collection("user_profiles").doc(userId).get();
      const existing = existingDoc.exists ? existingDoc.data()! : {};

      // Auto-fetch the Telegram profile photo only if the user has no avatar yet
      // (so a custom uploaded avatar is never overwritten).
      let avatar = existing.avatar ?? null;
      if (!avatar) {
        avatar = await fetchTelegramAvatar(userId, from.id);
      }

      const user = {
        id: userId,
        name: existing.name || name,
        // Preserve a real (linked) email; only use the placeholder for pure-TG accounts.
        email: existing.email || `${from.id}@telegram.local`,
        telegram: from.username ? `@${from.username}` : existing.telegram,
        telegramId: from.id,
        chatId,
        phone: contact.phone_number,
        avatar,
        bio: existing.bio ?? null,
        socialLinks: existing.socialLinks ?? null,
        createdAt: existing.createdAt ?? new Date().toISOString(),
      };

      // Upsert profile in Firestore
      await db.collection("user_profiles").doc(userId).set(
        { ...user, lastLogin: new Date().toISOString() },
        { merge: true }
      );

      // Complete auth session
      await sessionRef.update({ status: "completed", user });

      // Clean up chat session mapping
      await db.collection("bot_chat_sessions").doc(String(chatId)).delete();

      // Mint a signed user token and embed it in the deep-link URL so that
      // clicking the button from Telegram automatically authenticates the user
      // in the browser without a second login step.
      const userToken = mintUserToken(userId);
      const profileUrl = userToken
        ? `${SITE_URL}/profile?t=${encodeURIComponent(userToken)}`
        : `${SITE_URL}/profile`;

      // Send confirmation with deep link
      await sendMessage(chatId,
        `✅ <b>Вход выполнен!</b>\n\nНажмите кнопку ниже, чтобы открыть ваш профиль.`,
        {
          reply_markup: {
            inline_keyboard: [[{
              text: "👤 Перейти в профиль",
              url: profileUrl,
            }]],
          },
        }
      );

      return ok();
    }

    // Any other message while waiting for contact
    const chatSession = await db.collection("bot_chat_sessions").doc(String(chatId)).get();
    if (chatSession.exists) {
      await sendMessage(chatId,
        "Нажмите кнопку «📱 Поделиться номером» для завершения входа.",
        {
          reply_markup: {
            keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
    }

    return ok();
  } catch (e) {
    console.error("[telegram-webhook]", e);
    return ok();
  }
}
