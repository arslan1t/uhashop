import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";

function getDb() {
  const cfg = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
  if (!cfg.apiKey) return null;
  const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
  return getFirestore(app);
}

export async function POST(req: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { teamName, captainName, captainPhone, captainTg, players } = body;

    // Validate
    if (!teamName || !captainName || !captainPhone || players.length < 3) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanPlayers = players.filter((p: string) => p.trim());

    // Save to Firestore
    const docRef = await addDoc(collection(db, "league_team_registrations"), {
      teamName,
      captainName,
      captainPhone,
      captainTg,
      players: cleanPlayers,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // Send Telegram notification to admin (non-blocking)
    const playersList = cleanPlayers.map((p: string, i: number) => `  ${i + 1}. ${escapeHtml(p)}`).join("\n");
    sendTelegramMessage(
      `🏀 <b>Новая регистрация команды!</b>\n\n` +
      `🏆 Команда: <b>${escapeHtml(teamName)}</b>\n` +
      `👤 Капитан: ${escapeHtml(captainName)}\n` +
      `📞 Телефон: ${escapeHtml(captainPhone)}\n` +
      `📨 Telegram: ${escapeHtml(captainTg || "—")}\n\n` +
      `👥 <b>Игроки:</b>\n${playersList}`
    ).catch(console.error);

    return NextResponse.json({ id: docRef.id }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
