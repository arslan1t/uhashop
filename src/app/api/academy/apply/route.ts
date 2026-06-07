/**
 * Academy application API:
 * 1. Saves application to Firestore
 * 2. Sends Telegram notification to admin
 */
import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

const SKILL_LABELS: Record<string, string> = {
  beginner:     "Начинающий",
  intermediate: "Любитель",
  advanced:     "Продвинутый",
  pro:          "Профессионал",
};

async function saveToFirestore(data: Record<string, unknown>): Promise<string> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!projectId || !apiKey) throw new Error("Firebase not configured");

  // Use Firestore REST API — works reliably server-side without client SDK issues
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/academy_applications?key=${apiKey}`;

  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === null || v === undefined) {
      fields[k] = { nullValue: null };
    } else if (typeof v === "string") {
      fields[k] = { stringValue: v };
    } else if (typeof v === "number") {
      fields[k] = { integerValue: String(v) };
    } else if (typeof v === "boolean") {
      fields[k] = { booleanValue: v };
    }
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Firestore error ${res.status}`);
  }

  const doc = await res.json();
  // Extract doc ID from name: "projects/.../documents/academy_applications/{id}"
  return doc.name?.split("/").pop() ?? "unknown";
}

async function sendTelegram(text: string): Promise<void> {
  await sendTelegramMessage(text).catch(console.error);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { parentName, parentTg, age, athleteName, height, weight, skillLevel } = body;

    if (!parentName?.trim() || !parentTg?.trim() || !age) {
      return NextResponse.json({ error: "Обязательные поля не заполнены" }, { status: 400 });
    }

    const tg = String(parentTg).trim();
    const formattedTg = tg.startsWith("@") ? tg : `@${tg}`;

    // 1. Save via Firestore REST API (no client SDK issues)
    const docId = await saveToFirestore({
      parentName:  String(parentName).trim(),
      parentTg:    formattedTg,
      age:         Number(age),
      athleteName: athleteName?.trim() || null,
      height:      height ? Number(height) : null,
      weight:      weight ? Number(weight) : null,
      skillLevel:  skillLevel || null,
      status:      "new",
      createdAt:   new Date().toISOString(),
    });

    // 2. Send Telegram notification
    const lines = [
      "🏀 <b>Новая заявка в UHA Academy!</b>",
      "",
      `👤 <b>Родитель:</b> ${String(parentName).trim()}`,
      `📱 <b>Telegram:</b> ${formattedTg}`,
      `🎂 <b>Возраст:</b> ${age} лет`,
    ];
    if (athleteName?.trim()) lines.push(`🏅 <b>Спортсмен:</b> ${athleteName.trim()}`);
    if (height)              lines.push(`📏 <b>Рост:</b> ${height} см`);
    if (weight)              lines.push(`⚖️ <b>Вес:</b> ${weight} кг`);
    if (skillLevel)          lines.push(`🎯 <b>Уровень:</b> ${SKILL_LABELS[skillLevel] ?? skillLevel}`);
    lines.push("", `🆔 <code>${docId}</code>`);

    await sendTelegram(lines.join("\n"));

    return NextResponse.json({ success: true, id: docId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Academy apply error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
