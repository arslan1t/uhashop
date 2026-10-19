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
import { normalizeName } from "@/lib/academy-match";
import { sendTelegramMessage } from "@/lib/telegram";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://uhashop.uz";

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

async function answerCallbackQuery(id: string, text?: string) {
  await tgPost("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
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

/** Mints an academy session token and sends the "open kabinet" deep link. */
async function sendAcademyLoginLink(chatId: number, role: "athlete" | "parent", accountId: string): Promise<string | null> {
  const token = mintUserToken(`academy:${role}:${accountId}`);
  const loginUrl = token ? `${SITE_URL}/academy/login?t=${encodeURIComponent(token)}` : `${SITE_URL}/academy/login`;
  await sendMessage(chatId,
    "✅ <b>Вход выполнен!</b>\n\nНажмите кнопку ниже, чтобы открыть личный кабинет.",
    { reply_markup: { inline_keyboard: [[{ text: "👤 Открыть кабинет", url: loginUrl }]] } }
  );
  return token;
}

/** Bridges an academy record to the unified shop account (tg_<telegramId>):
 *  writes academy_*.userId, ensures a user_profiles doc exists, and stamps
 *  .academy = {role, academyId} on it so the unified profile shows the
 *  Академия section. Best-effort — never throws into the login flow. */
async function bridgeAcademyAccount(
  db: ReturnType<typeof getAdminDb>,
  role: "athlete" | "parent",
  accountId: string,
  chatId: number,
  telegramId: number,
  fromUsername?: string,
) {
  try {
    const shopUserId = `tg_${telegramId}`;
    const collection = role === "athlete" ? "academy_athletes" : "academy_parents";
    await db.collection(collection).doc(accountId).set({ userId: shopUserId }, { merge: true });

    const profileRef = db.collection("user_profiles").doc(shopUserId);
    const profileSnap = await profileRef.get();
    const academyDoc = (await db.collection(collection).doc(accountId).get()).data() ?? {};
    const academyLink = { role, academyId: accountId, linkedAt: new Date().toISOString() };

    if (profileSnap.exists) {
      await profileRef.set({ academy: academyLink, chatId }, { merge: true });
    } else {
      // Member who never used the shop yet — seed a minimal unified profile so
      // /profile works for them immediately after their first academy login.
      await profileRef.set({
        id: shopUserId,
        name: academyDoc.name ?? "Пользователь",
        email: `${telegramId}@telegram.local`,
        telegram: fromUsername ? `@${fromUsername}` : null,
        phone: academyDoc.phone ?? null,
        chatId,
        academy: academyLink,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (e) {
    console.error("[telegram-webhook] bridge failed:", e);
  }
}

/** Links chatId to an academy account (+ fetches avatar for athletes), then
 *  sends the login link. Shared by every "first-time link" path regardless
 *  of how it was started (website deep link or the bot's own menu). */
async function linkChatAndLogin(
  db: ReturnType<typeof getAdminDb>,
  role: "athlete" | "parent",
  accountId: string,
  chatId: number,
  telegramId: number,
  fromUsername?: string,
): Promise<string | null> {
  const collection = role === "athlete" ? "academy_athletes" : "academy_parents";
  const update: Record<string, unknown> = { chatId };
  if (role === "athlete") {
    const doc = await db.collection(collection).doc(accountId).get();
    if (!doc.data()?.avatar) {
      const avatar = await fetchTelegramAvatar(accountId, telegramId);
      if (avatar) update.avatar = avatar;
    }
  }
  await db.collection(collection).doc(accountId).set(update, { merge: true });
  await bridgeAcademyAccount(db, role, accountId, chatId, telegramId, fromUsername);
  return sendAcademyLoginLink(chatId, role, accountId);
}

/** Finalizes an academy Telegram login started from the website (?t= deep
 *  link flow) — same as linkChatAndLogin, but also marks that website-side
 *  session completed so its poller picks up the token. */
async function completeAcademyLogin(
  db: ReturnType<typeof getAdminDb>,
  telegramSessionId: string,
  role: "athlete" | "parent",
  accountId: string,
  chatId: number,
  telegramId: number,
  fromUsername?: string,
) {
  const token = await linkChatAndLogin(db, role, accountId, chatId, telegramId, fromUsername);
  await db.collection("academy_telegram_sessions").doc(telegramSessionId).update({ status: "completed", token });
}

type Db = ReturnType<typeof getAdminDb>;
type Intent = "menu" | "academy" | "shop";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TgFrom = any;

/** Resolves the stable unified-account id for a Telegram identity. */
async function resolveUserId(db: Db, telegramId: number): Promise<string> {
  const linkDoc = await db.collection("telegram_links").doc(String(telegramId)).get();
  if (linkDoc.exists && linkDoc.data()?.userId) return linkDoc.data()!.userId as string;
  return `tg_${telegramId}`;
}

/** A unified account counts as "registered" once it has a name AND a phone —
 *  i.e. the user completed the one-time phone+name onboarding. */
async function isRegistered(db: Db, userId: string): Promise<boolean> {
  const d = (await db.collection("user_profiles").doc(userId).get()).data();
  return !!(d && d.name && d.phone);
}

/** Upserts the unified shop profile (the one account for everything), reusing
 *  the existing telegram_links resolution + best-effort avatar fetch. */
async function upsertShopProfile(db: Db, from: TgFrom, chatId: number, phone: string | null, name: string | null) {
  const linkRef = db.collection("telegram_links").doc(String(from.id));
  const linkDoc = await linkRef.get();
  let userId: string;
  if (linkDoc.exists && linkDoc.data()?.userId) {
    userId = linkDoc.data()!.userId as string;
  } else {
    userId = `tg_${from.id}`;
    await linkRef.set({ userId, telegramId: from.id, linkedAt: new Date().toISOString() }, { merge: true });
  }
  const existing = (await db.collection("user_profiles").doc(userId).get()).data() ?? {};
  let avatar = existing.avatar ?? null;
  if (!avatar) avatar = await fetchTelegramAvatar(userId, from.id);

  const user = {
    id: userId,
    name: name ?? existing.name ?? from.first_name ?? "Игрок",
    email: existing.email || `${from.id}@telegram.local`,
    telegram: from.username ? `@${from.username}` : existing.telegram ?? null,
    telegramId: from.id,
    chatId,
    phone: phone ?? existing.phone ?? null,
    avatar,
    bio: existing.bio ?? null,
    socialLinks: existing.socialLinks ?? null,
    createdAt: existing.createdAt ?? new Date().toISOString(),
  };
  await db.collection("user_profiles").doc(userId).set({ ...user, lastLogin: new Date().toISOString() }, { merge: true });
  return { userId, user };
}

/** Completes a shop website session (if any) and sends the profile deep link. */
async function sendShopLogin(db: Db, userId: string, user: object, chatId: number, authSessionId?: string) {
  if (authSessionId) {
    await db.collection("auth_sessions").doc(authSessionId).update({ status: "completed", user }).catch(() => {});
  }
  const token = mintUserToken(userId);
  const url = token ? `${SITE_URL}/profile?t=${encodeURIComponent(token)}` : `${SITE_URL}/profile`;
  await sendMessage(chatId, "✅ <b>Вход выполнен!</b>\n\nНажмите кнопку ниже, чтобы открыть профиль.",
    { reply_markup: { inline_keyboard: [[{ text: "👤 Перейти в профиль", url }]] } });
}

/** The post-registration hub: pick a section. */
async function showSectionMenu(chatId: number) {
  await sendMessage(chatId, "Готово! Куда хотите войти?", {
    reply_markup: { inline_keyboard: [
      [{ text: "🛍 Магазин", callback_data: "menu_shop" }],
      [{ text: "🏀 Академия", callback_data: "menu_academy" }],
      [{ text: "🏆 Лига", callback_data: "menu_league" }],
    ] },
  });
}

/** Does this user already belong to the academy? Checks the unified link
 *  first, then a chatId match on the academy docs (for older accounts). */
async function findUserAcademy(db: Db, userId: string, chatId: number): Promise<{ role: "athlete" | "parent"; id: string } | null> {
  const prof = (await db.collection("user_profiles").doc(userId).get()).data();
  if (prof?.academy?.academyId && prof.academy.role) return { role: prof.academy.role, id: prof.academy.academyId };
  const a = await db.collection("academy_athletes").where("chatId", "==", chatId).limit(1).get();
  if (!a.empty) return { role: "athlete", id: a.docs[0].id };
  const p = await db.collection("academy_parents").where("chatId", "==", chatId).limit(1).get();
  if (!p.empty) return { role: "parent", id: p.docs[0].id };
  return null;
}

/** Academy entry: log in if already a member, else ask role (or use preset
 *  role from the website session) → leads to self-chosen password. */
async function dispatchAcademy(db: Db, from: TgFrom, chatId: number, academySessionId?: string, presetRole?: "athlete" | "parent") {
  const userId = await resolveUserId(db, from.id);
  const existing = await findUserAcademy(db, userId, chatId);
  if (existing) {
    if (academySessionId) await completeAcademyLogin(db, academySessionId, existing.role, existing.id, chatId, from.id, from.username);
    else await linkChatAndLogin(db, existing.role, existing.id, chatId, from.id, from.username);
    return;
  }
  if (presetRole) {
    await db.collection("bot_chat_sessions").doc(String(chatId)).set({ flow: "academy_password", step: "password", role: presetRole, ...(academySessionId ? { academySessionId } : {}) });
    await sendMessage(chatId, "Придумайте <b>пароль</b> для входа в академию (минимум 4 символа). По нему вы будете заходить самостоятельно:");
    return;
  }
  await db.collection("bot_chat_sessions").doc(String(chatId)).set({ flow: "await_role", ...(academySessionId ? { academySessionId } : {}) });
  await sendMessage(chatId, "Вы спортсмен или родитель?", {
    reply_markup: { inline_keyboard: [[
      { text: "🏀 Спортсмен", callback_data: "role_athlete" },
      { text: "👤 Родитель", callback_data: "role_parent" },
    ]] },
  });
}

/** Creates a live academy account from a self-registration — or, if an
 *  unlinked record with the same name already exists (admin pre-created it),
 *  links that one and sets the chosen password as its visible code. The
 *  member's name, phone and Telegram (captured at the phone+name signup) are
 *  carried onto the academy record too, so the trainer can reach them. */
async function createOrLinkAcademyAccount(db: Db, role: "athlete" | "parent", name: string, code: string, phone: string | null, chatId: number, from: TgFrom): Promise<string> {
  const collection = role === "athlete" ? "academy_athletes" : "academy_parents";
  const telegram = from.username ? `@${from.username}` : "";
  const contact: Record<string, unknown> = { name, pin: code, chatId };
  if (phone) contact.phone = phone;
  if (telegram) contact.telegram = telegram;

  const nameNorm = normalizeName(name);
  const snap = await db.collection(collection).get();
  const match = snap.docs.find(d => {
    const data = d.data();
    return typeof data.name === "string" && normalizeName(data.name) === nameNorm && !data.userId;
  });

  let accountId: string;
  if (match) {
    accountId = match.id;
    // Fill in contact fields only where the existing record is still empty.
    const existing = match.data();
    const fill: Record<string, unknown> = { pin: code, chatId };
    if (phone && !existing.phone) fill.phone = phone;
    if (telegram && !existing.telegram) fill.telegram = telegram;
    await db.collection(collection).doc(accountId).set(fill, { merge: true });
  } else {
    accountId = role === "athlete" ? `a_${Date.now()}` : `p_${Date.now()}`;
    const base = role === "athlete"
      ? { id: accountId, birthDate: "", ageGroup: "", position: "", status: "trial", joinedAt: new Date().toISOString().slice(0, 10), ...contact }
      : { id: accountId, phone: "", childrenIds: [], createdAt: new Date().toISOString(), ...contact };
    await db.collection(collection).doc(accountId).set(base);
  }
  await bridgeAcademyAccount(db, role, accountId, chatId, from.id, from.username);
  return accountId;
}

export async function POST(req: NextRequest) {
  // Validate webhook secret if configured
  if (WEBHOOK_SECRET) {
    const incoming = req.headers.get("x-telegram-bot-api-secret-token") ?? "";
    if (incoming !== WEBHOOK_SECRET) return ok();
  }

  try {
    const update = await req.json();
    const db = getAdminDb();

    // ── Inline keyboard taps (section menu, role pick) ─────────────────────
    const cq = update.callback_query;
    if (cq) {
      await answerCallbackQuery(cq.id);
      const cbChatId: number = cq.message.chat.id;
      const cbFrom = cq.from ?? {};

      if (cq.data === "menu_shop") {
        const userId = await resolveUserId(db, cbFrom.id);
        const profile = (await db.collection("user_profiles").doc(userId).get()).data() ?? {};
        await sendShopLogin(db, userId, { ...profile, id: userId, chatId: cbChatId }, cbChatId);
        return ok();
      }

      if (cq.data === "menu_academy") {
        await dispatchAcademy(db, cbFrom, cbChatId);
        return ok();
      }

      if (cq.data === "menu_league") {
        await sendMessage(cbChatId,
          "🏆 <b>UHA League</b>\n\n🛠 Сервис в разработке.\nСовсем скоро здесь можно будет регистрировать команды и следить за турнирами 3×3!");
        return ok();
      }

      if (cq.data === "role_athlete" || cq.data === "role_parent") {
        const role = cq.data === "role_athlete" ? "athlete" : "parent";
        const sess = (await db.collection("bot_chat_sessions").doc(String(cbChatId)).get()).data() ?? {};
        const academySessionId = sess.academySessionId as string | undefined;
        await db.collection("bot_chat_sessions").doc(String(cbChatId)).set(
          { flow: "academy_password", step: "password", role, ...(academySessionId ? { academySessionId } : {}) }
        );
        await sendMessage(cbChatId,
          "Придумайте <b>пароль</b> для входа в академию (минимум 4 символа). По нему вы будете заходить самостоятельно:");
        return ok();
      }

      return ok();
    }

    const msg = update.message;
    if (!msg) return ok();

    const chatId: number = msg.chat.id;
    const from = msg.from ?? {};

    // ── /start aplink_SESSION_ID — academy parent linking their Telegram for
    // payment-reminder notifications. No registration needed — just /start.
    if (msg.text?.startsWith("/start aplink_")) {
      const linkSessionId = msg.text.split(" ")[1]?.trim().replace(/^aplink_/, "") ?? "";
      const linkSessionRef = db.collection("academy_link_sessions").doc(linkSessionId);
      const linkSession = await linkSessionRef.get();

      if (!linkSession.exists) {
        await sendMessage(chatId, "⚠️ Ссылка недействительна. Вернитесь на страницу родителя и попробуйте снова.");
        return ok();
      }
      const linkData = linkSession.data()!;
      if (new Date(linkData.expiresAt as string) < new Date()) {
        await sendMessage(chatId, "⏱ Время сессии истекло. Вернитесь на страницу родителя и нажмите кнопку снова.");
        return ok();
      }

      await db.collection("academy_parents").doc(linkData.parentId as string).set({ chatId }, { merge: true });
      await linkSessionRef.update({ status: "completed" });

      await sendMessage(chatId,
        "✅ <b>Telegram подключен!</b>\n\nТеперь вы будете получать уведомления об оплате от UHA Academy."
      );
      return ok();
    }

    // ── /start [payload] — the single entry point. Everyone registers once
    // (phone + name), then is dispatched: shop deep-link → profile, academy
    // deep-link → academy onboarding, bare /start → section menu. ───────────
    if (msg.text?.startsWith("/start")) {
      const payload = msg.text.split(" ")[1]?.trim() ?? "";

      let intent: Intent = "menu";
      let academySessionId: string | undefined;
      let authSessionId: string | undefined;
      let presetRole: "athlete" | "parent" | undefined;

      if (payload.startsWith("aclogin_")) {
        intent = "academy";
        const sid = payload.replace(/^aclogin_/, "");
        academySessionId = sid;
        const s = await db.collection("academy_telegram_sessions").doc(sid).get();
        if (!s.exists) { await sendMessage(chatId, "⚠️ Ссылка недействительна. Вернитесь на страницу входа и попробуйте снова."); return ok(); }
        if (new Date(s.data()!.expiresAt as string) < new Date()) { await sendMessage(chatId, "⏱ Время сессии истекло. Вернитесь на страницу входа и нажмите кнопку снова."); return ok(); }
        presetRole = s.data()!.role as "athlete" | "parent" | undefined;
      } else if (payload) {
        intent = "shop";
        authSessionId = payload;
        const s = await db.collection("auth_sessions").doc(payload).get();
        if (!s.exists) { await sendMessage(chatId, "⚠️ Ссылка недействительна. Вернитесь на сайт и попробуйте снова."); return ok(); }
        if (new Date(s.data()!.expiresAt as string) < new Date()) { await sendMessage(chatId, "⏱ Время сессии истекло. Вернитесь на сайт и нажмите кнопку снова."); return ok(); }
        await s.ref.update({ status: "waiting_contact", chatId });
      }

      const userId = await resolveUserId(db, from.id);

      // First-time visitor anywhere on the site → one-time phone+name signup.
      if (!(await isRegistered(db, userId))) {
        await db.collection("bot_chat_sessions").doc(String(chatId)).set({
          flow: "register", step: "contact", intent,
          ...(academySessionId ? { academySessionId } : {}),
          ...(authSessionId ? { authSessionId } : {}),
          ...(presetRole ? { presetRole } : {}),
        });
        await sendMessage(chatId,
          `👋 Добро пожаловать в <b>UHA</b>!\n\nДавайте познакомимся. Поделитесь номером телефона для регистрации:`,
          { reply_markup: { keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } }
        );
        return ok();
      }

      // Already registered → straight to the requested section.
      if (intent === "shop") {
        const { user } = await upsertShopProfile(db, from, chatId, null, null);
        await sendShopLogin(db, userId, user, chatId, authSessionId);
      } else if (intent === "academy") {
        await dispatchAcademy(db, from, chatId, academySessionId, presetRole);
      } else {
        await showSectionMenu(chatId);
      }
      return ok();
    }

    // ── Contact shared — only meaningful during the one-time registration ──
    if (msg.contact) {
      const sess = (await db.collection("bot_chat_sessions").doc(String(chatId)).get()).data();
      if (sess?.flow === "register") {
        await db.collection("bot_chat_sessions").doc(String(chatId)).set(
          { ...sess, step: "name", phone: msg.contact.phone_number }, { merge: true }
        );
        await sendMessage(chatId, "Спасибо! Теперь напишите ваше <b>Имя и Фамилию</b>:", { reply_markup: { remove_keyboard: true } });
        return ok();
      }
      await sendMessage(chatId, "Отправьте /start, чтобы начать.", { reply_markup: { remove_keyboard: true } });
      return ok();
    }

    // ── Text replies (driven by the bot_chat_sessions state) ───────────────
    const sess = (await db.collection("bot_chat_sessions").doc(String(chatId)).get()).data();
    const isText = msg.text && !msg.text.startsWith("/");

    // Registration step 2: the name → create the unified account, then dispatch.
    if (sess?.flow === "register" && sess.step === "name" && isText) {
      const name = (msg.text as string).trim().slice(0, 80);
      if (name.length < 2) { await sendMessage(chatId, "Имя слишком короткое — напишите Имя и Фамилию полностью."); return ok(); }

      const { userId, user } = await upsertShopProfile(db, from, chatId, sess.phone ?? null, name);
      await db.collection("bot_chat_sessions").doc(String(chatId)).delete();

      if (sess.intent === "shop") {
        await sendShopLogin(db, userId, user, chatId, sess.authSessionId);
      } else if (sess.intent === "academy") {
        await dispatchAcademy(db, from, chatId, sess.academySessionId, sess.presetRole);
      } else {
        await showSectionMenu(chatId);
      }
      return ok();
    }

    // Academy: the self-chosen password → create-or-link a live academy account.
    if (sess?.flow === "academy_password" && isText) {
      const pw = (msg.text as string).trim();
      if (pw.length < 4) { await sendMessage(chatId, "Пароль слишком короткий — минимум 4 символа. Напишите другой:"); return ok(); }

      const role = sess.role as "athlete" | "parent";
      const userId = await resolveUserId(db, from.id);
      const profile = (await db.collection("user_profiles").doc(userId).get()).data() ?? {};
      const name = (profile.name as string) || from.first_name || "Спортсмен";
      const phone = (profile.phone as string) || null;

      const accountId = await createOrLinkAcademyAccount(db, role, name, pw, phone, chatId, from);
      await db.collection("bot_chat_sessions").doc(String(chatId)).delete();

      if (sess.academySessionId) {
        await completeAcademyLogin(db, sess.academySessionId as string, role, accountId, chatId, from.id, from.username);
      } else {
        await sendAcademyLoginLink(chatId, role, accountId);
      }

      await sendTelegramMessage(
        `🆕 <b>Новый ${role === "athlete" ? "спортсмен" : "родитель"} в академии</b>\n\n` +
        `👤 ${name}\n` +
        (phone ? `📞 Телефон: ${phone}\n` : "") +
        (from.username ? `✈️ Telegram: @${from.username}\n` : "") +
        `🔑 Код входа: <code>${pw}</code>\n` +
        `\nОткройте админку → Академия, чтобы заполнить данные и связать родителя/ребёнка.`
      ).catch(console.error);
      return ok();
    }

    // ── Re-prompts when the user types something unexpected mid-flow ────────
    if (sess?.flow === "await_role") {
      await sendMessage(chatId, "Выберите кнопкой выше: 🏀 Спортсмен или 👤 Родитель.");
      return ok();
    }
    if (sess?.flow === "register" && sess.step === "contact") {
      await sendMessage(chatId, "Поделитесь номером телефона кнопкой ниже, чтобы продолжить:",
        { reply_markup: { keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } });
      return ok();
    }
    if (sess?.flow === "register" && sess.step === "name") {
      await sendMessage(chatId, "Напишите ваше Имя и Фамилию текстом:");
      return ok();
    }
    if (sess?.flow === "academy_password") {
      await sendMessage(chatId, "Напишите пароль текстом (минимум 4 символа):");
      return ok();
    }

    // ── Bare message with no active flow → treat like /start ───────────────
    {
      const userId = await resolveUserId(db, from.id);
      if (await isRegistered(db, userId)) {
        await showSectionMenu(chatId);
      } else {
        await db.collection("bot_chat_sessions").doc(String(chatId)).set({ flow: "register", step: "contact", intent: "menu" });
        await sendMessage(chatId,
          "👋 Добро пожаловать в <b>UHA</b>!\n\nПоделитесь номером телефона для регистрации:",
          { reply_markup: { keyboard: [[{ text: "📱 Поделиться номером", request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } }
        );
      }
      return ok();
    }
  } catch (e) {
    console.error("[telegram-webhook]", e);
    return ok();
  }
}
