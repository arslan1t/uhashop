/**
 * Academy application API:
 * 1. Saves application to Firestore
 * 2. Sends Telegram notification to admin
 */
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

function getDb() {
  const cfg = {
    apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
  const app = getApps().length > 0 ? getApp() : initializeApp(cfg);
  return getFirestore(app);
}

const SKILL_LABELS: Record<string, string> = {
  beginner:     "Начинающий",
  intermediate: "Любитель",
  advanced:     "Продвинутый",
  pro:          "Профессионал",
};

async function sendTelegram(text: string): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return; // silently skip if not configured

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentName, parentTg, age, athleteName, height, weight, skillLevel } = body;

    if (!parentName || !parentTg || !age) {
      return NextResponse.json({ error: "Обязательные поля не заполнены" }, { status: 400 });
    }

    // 1. Save to Firestore
    const db = getDb();
    const docRef = await addDoc(collection(db, "academy_applications"), {
      parentName,
      parentTg: parentTg.startsWith("@") ? parentTg : `@${parentTg}`,
      age: Number(age),
      athleteName: athleteName || null,
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      skillLevel: skillLevel || null,
      status: "new",
      notes: null,
      createdAt: serverTimestamp(),
    });

    // 2. Send Telegram notification
    const lines = [
      "🏀 <b>Новая заявка в UHA Academy!</b>",
      "",
      `👤 <b>Родитель:</b> ${parentName}`,
      `📱 <b>Telegram:</b> ${parentTg.startsWith("@") ? parentTg : "@" + parentTg}`,
      `🎂 <b>Возраст спортсмена:</b> ${age} лет`,
    ];
    if (athleteName) lines.push(`🏅 <b>Спортсмен:</b> ${athleteName}`);
    if (height)      lines.push(`📏 <b>Рост:</b> ${height} см`);
    if (weight)      lines.push(`⚖️ <b>Вес:</b> ${weight} кг`);
    if (skillLevel)  lines.push(`🎯 <b>Уровень:</b> ${SKILL_LABELS[skillLevel] ?? skillLevel}`);
    lines.push("", `🆔 ID заявки: <code>${docRef.id}</code>`);

    await sendTelegram(lines.join("\n"));

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("Academy apply error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
