import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthUserId } from "@/lib/user-auth";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, captainName, captainPhone, captainTg, players } = body as {
      teamName: string;
      captainName: string;
      captainPhone: string;
      captainTg: string;
      players: string[];
    };

    // Validate — 4 players required
    if (!teamName || !captainName || !captainPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const cleanPlayers = (players ?? []).map((p: string) => p.trim()).filter(Boolean);
    if (cleanPlayers.length < 4) {
      return NextResponse.json({ error: "Необходимо указать 4 игроков" }, { status: 400 });
    }

    // Link to the unified account if the captain is signed in.
    const userId = getAuthUserId(req);

    // Save to Firestore via Admin SDK
    const db     = getAdminDb();
    const docRef = await db.collection("league_team_registrations").add({
      teamName,
      captainName,
      captainPhone,
      captainTg:  captainTg || "",
      players:    cleanPlayers,
      status:     "pending",
      createdAt:  new Date().toISOString(),
      ...(userId ? { userId } : {}),
    });

    // Telegram notification to admin
    const playersList = cleanPlayers
      .map((p, i) => `  ${i + 1}. ${escapeHtml(p)}`)
      .join("\n");

    sendTelegramMessage(
      `🏀 <b>Новая регистрация команды!</b>\n\n` +
      `🏆 Команда: <b>${escapeHtml(teamName)}</b>\n` +
      `👤 Капитан: <b>${escapeHtml(captainName)}</b>\n` +
      `📱 Телефон: <code>${escapeHtml(captainPhone)}</code>\n` +
      `📨 Telegram: ${captainTg ? `@${escapeHtml(captainTg.replace("@", ""))}` : "—"}\n\n` +
      `👥 <b>Состав (4 игрока):</b>\n${playersList}\n\n` +
      `🆔 ID заявки: <code>${docRef.id}</code>`
    ).catch(console.error);

    return NextResponse.json({ ok: true, id: docRef.id });
  } catch (e) {
    console.error("Team registration failed:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

/** GET — the signed-in captain's own team registrations (for the profile). */
export async function GET(req: NextRequest) {
  const userId = getAuthUserId(req);
  if (!userId) return NextResponse.json({ teams: [] });
  try {
    const db = getAdminDb();
    const snap = await db.collection("league_team_registrations").where("userId", "==", userId).get();
    const teams = snap.docs
      .map(d => ({ id: d.id, teamName: d.data().teamName, status: d.data().status, createdAt: d.data().createdAt }))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return NextResponse.json({ teams });
  } catch (e) {
    return NextResponse.json({ error: String(e), teams: [] }, { status: 500 });
  }
}
