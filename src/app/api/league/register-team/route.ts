import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

    // Save to Firestore
    const docRef = await addDoc(collection(db, "league_team_registrations"), {
      teamName,
      captainName,
      captainPhone,
      captainTg,
      players: players.filter((p: string) => p.trim()),
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    // TODO: Send Telegram notification to admin
    // const botToken = process.env.TELEGRAM_BOT_TOKEN;
    // const chatId = process.env.TELEGRAM_CHAT_ID;
    // await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     chat_id: chatId,
    //     text: `🏀 Новая регистрация команды:\n\nКоманда: ${teamName}\nКапитан: ${captainName}\nТелефон: ${captainPhone}\nTelegram: ${captainTg}`,
    //   }),
    // });

    return NextResponse.json({ id: docRef.id }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
