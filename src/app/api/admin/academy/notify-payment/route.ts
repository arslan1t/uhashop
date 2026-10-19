/**
 * Sends a parent a payment reminder via Telegram. Requires the parent to
 * have already linked their Telegram chat (see /api/academy/parent-link) —
 * a bot can't message someone who has never started a chat with it.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/admin-auth";
import { isTrainerAuthorized } from "@/lib/trainer-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { formatCurrency, formatMonthRu, PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/data/academy";

function isAuthorized(req: NextRequest): boolean {
  return isAdminAuthorized(req) || isTrainerAuthorized(req);
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendToChat(chatId: number, text: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorizedResponse();

  try {
    const { paymentId } = (await req.json()) as { paymentId?: string };
    if (!paymentId) return NextResponse.json({ error: "paymentId required" }, { status: 400 });

    const db = getAdminDb();
    const paymentSnap = await db.collection("academy_payments").doc(paymentId).get();
    if (!paymentSnap.exists) return NextResponse.json({ error: "Платёж не найден" }, { status: 404 });
    const payment = paymentSnap.data()!;

    const parentSnap = await db.collection("academy_parents").doc(payment.parentId).get();
    if (!parentSnap.exists) return NextResponse.json({ error: "Родитель не найден" }, { status: 404 });
    const parent = parentSnap.data()!;

    if (!parent.chatId) {
      return NextResponse.json({ error: "Родитель ещё не подключил Telegram — попросите его открыть личный кабинет родителя и нажать «Подключить Telegram»." }, { status: 400 });
    }

    const athleteSnap = await db.collection("academy_athletes").doc(payment.athleteId).get();
    const athleteName = athleteSnap.exists ? athleteSnap.data()!.name : "—";

    const status = (payment.status as PaymentStatus) ?? "pending";
    const lines = [
      "💳 <b>Напоминание об оплате — UHA Academy</b>",
      "",
      `🏀 Спортсмен: <b>${athleteName}</b>`,
      `📅 Месяц: ${formatMonthRu(payment.month)}`,
      `💰 Сумма: <b>${formatCurrency(payment.amount)}</b>`,
      `📌 Статус: ${PAYMENT_STATUS_LABELS[status]}`,
      "",
      "Пожалуйста, произведите оплату. Если уже оплатили — сообщите тренеру.",
    ];

    const sent = await sendToChat(parent.chatId, lines.join("\n"));
    if (!sent) return NextResponse.json({ error: "Не удалось отправить сообщение в Telegram" }, { status: 502 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
