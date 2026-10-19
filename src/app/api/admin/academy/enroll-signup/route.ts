/**
 * Completes a bot self-registration (see /api/telegram-webhook) into a real
 * academy_athletes/academy_parents account. The password the person chose
 * in Telegram is carried over from the secure secrets collection — never
 * re-entered, never exposed to the browser.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { isTrainerAuthorized } from "@/lib/trainer-auth";
import { getAdminDb } from "@/lib/firebase/admin";

function isAuthorized(req: NextRequest): boolean {
  return isAdminAuthorized(req) || isTrainerAuthorized(req);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  try {
    const body = await req.json() as {
      applicationId?: string; role?: "athlete" | "parent";
      ageGroup?: string; position?: string; parentId?: string;
      phone?: string; email?: string;
    };
    const { applicationId, role } = body;
    if (!applicationId || (role !== "athlete" && role !== "parent")) {
      return NextResponse.json({ error: "applicationId и role обязательны" }, { status: 400 });
    }

    const db = getAdminDb();
    const appRef = db.collection("academy_applications").doc(applicationId);
    const appSnap = await appRef.get();
    if (!appSnap.exists) return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    const application = appSnap.data()!;
    if (application.status === "enrolled") {
      return NextResponse.json({ error: "Заявка уже зачислена" }, { status: 409 });
    }

    const secretRef = db.collection("academy_signup_secrets").doc(applicationId);
    const secretSnap = await secretRef.get();
    if (!secretSnap.exists) {
      return NextResponse.json({ error: "Не найден код доступа для этой заявки" }, { status: 404 });
    }
    const secret = secretSnap.data()!;
    // New signups store the code in plaintext (`code`); older ones may have a
    // `passwordHash`. Prefer the visible code so the trainer can recover it.
    const code = typeof secret.code === "string" ? secret.code : undefined;
    const passwordHash = typeof secret.passwordHash === "string" ? secret.passwordHash : undefined;
    // The credential written to the account: a visible `pin` when we have the
    // plaintext code, else fall back to the legacy hash.
    const credFields = code ? { pin: code } : (passwordHash ? { passwordHash } : {});

    const id = role === "athlete" ? `a_${Date.now()}` : `p_${Date.now()}`;
    const name = application.parentName as string;
    // A bot signup carries its Telegram id → bridge it to the unified shop
    // account (tg_<id>) so the new member's /profile shows the Академия section.
    const telegramId = typeof application.telegramId === "number" ? application.telegramId : null;
    const shopUserId = telegramId ? `tg_${telegramId}` : null;

    if (role === "athlete") {
      if (!body.ageGroup || !body.position) {
        return NextResponse.json({ error: "Укажите возрастную группу и позицию" }, { status: 400 });
      }
      await db.collection("academy_athletes").doc(id).set({
        id, name, birthDate: "2010-01-01", ageGroup: body.ageGroup, position: body.position,
        status: "trial", joinedAt: new Date().toISOString().slice(0, 10),
        ...credFields, chatId: application.chatId ?? null,
        ...(shopUserId ? { userId: shopUserId } : {}),
        ...(body.parentId ? { parentId: body.parentId } : {}),
      });
      if (body.parentId) {
        const parentRef = db.collection("academy_parents").doc(body.parentId);
        const parentSnap = await parentRef.get();
        const childrenIds: string[] = parentSnap.data()?.childrenIds ?? [];
        if (!childrenIds.includes(id)) {
          await parentRef.set({ childrenIds: [...childrenIds, id] }, { merge: true });
        }
      }
    } else {
      if (!body.phone?.trim()) {
        return NextResponse.json({ error: "Укажите телефон родителя" }, { status: 400 });
      }
      await db.collection("academy_parents").doc(id).set({
        id, name, phone: body.phone.trim(), email: body.email?.trim() || undefined,
        childrenIds: [], createdAt: new Date().toISOString(),
        ...credFields, chatId: application.chatId ?? null,
        ...(shopUserId ? { userId: shopUserId } : {}),
      });
    }

    // Stamp the academy link onto the unified shop profile (create if missing).
    if (shopUserId) {
      const academyLink = { role, academyId: id, linkedAt: new Date().toISOString() };
      const profileRef = db.collection("user_profiles").doc(shopUserId);
      const profileSnap = await profileRef.get();
      if (profileSnap.exists) {
        await profileRef.set({ academy: academyLink }, { merge: true });
      } else {
        await profileRef.set({
          id: shopUserId, name, email: `${telegramId}@telegram.local`,
          telegram: application.parentTg || null, chatId: application.chatId ?? null,
          academy: academyLink, createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    }

    await secretRef.delete();
    await appRef.update({ status: "enrolled", linkedAccountId: id, updatedAt: new Date().toISOString() });

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
