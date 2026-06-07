/**
 * Orders API — backed by Firestore (collection: "orders").
 * Also sends a Telegram notification to the admin on new orders.
 */
import { NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc,
  query, where, orderBy,
} from "firebase/firestore";
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

// ── Telegram notification ───────────────────────────────────────────
async function sendOrderNotification(order: {
  order_number: string;
  customer_name: string;
  telegram: string;
  phone?: string;
  city: string;
  address?: string;
  items: { name: string; size: string; qty: number; price: number }[];
  total: number;
  promo_code?: string;
  discount?: number;
  notes?: string;
}) {
  const itemsList = order.items
    .map((i) => `  • ${escapeHtml(i.name)} (${escapeHtml(i.size)}) ×${i.qty} — $${i.price * i.qty}`)
    .join("\n");

  let message =
    `🛒 <b>Новый заказ!</b>\n\n` +
    `📋 <b>${escapeHtml(order.order_number)}</b>\n` +
    `👤 ${escapeHtml(order.customer_name)}\n` +
    `📨 ${escapeHtml(order.telegram || "—")}\n` +
    `📞 ${escapeHtml(order.phone || "—")}\n` +
    `📍 ${escapeHtml(order.city)}${order.address ? `, ${escapeHtml(order.address)}` : ""}\n\n` +
    `📦 <b>Товары:</b>\n${itemsList}\n\n`;

  if (order.discount && order.discount > 0) {
    message += `🏷 Промокод: ${escapeHtml(order.promo_code || "")} (−$${order.discount})\n`;
  }

  message += `💰 <b>Итого: $${order.total}</b>`;

  if (order.notes) {
    message += `\n\n📝 ${escapeHtml(order.notes)}`;
  }

  await sendTelegramMessage(message);
}

// ── POST — create order ─────────────────────────────────────────────
export async function POST(req: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      items, total, customer_name, telegram, phone, city, address,
      notes, promo_code, discount, user_id,
    } = body;

    if (!items?.length || !customer_name || !telegram || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate order number: UHA-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `UHA-${dateStr}-${rand}`;

    const orderData = {
      order_number: orderNumber,
      user_id: user_id || null,
      items,
      total,
      status: "new",
      promo_code: promo_code || null,
      discount: discount || 0,
      shipping_address: { name: customer_name, telegram, phone: phone || null, city, address: address || null, notes: notes || null },
      created_at: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);

    // Send Telegram notification (non-blocking)
    sendOrderNotification({
      order_number: orderNumber, customer_name, telegram, phone, city, address,
      items, total, promo_code, discount, notes,
    }).catch(console.error);

    return NextResponse.json({ ok: true, order: { id: docRef.id, ...orderData } });
  } catch (e) {
    console.error("Order creation failed:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}

// ── GET — list orders ───────────────────────────────────────────────
export async function GET(req: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ orders: [] });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    const base = collection(db, "orders");
    const q = userId
      ? query(base, where("user_id", "==", userId))
      : query(base, orderBy("created_at", "desc"));

    const snap = await getDocs(q);
    let orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // user-scoped query can't orderBy without composite index — sort in memory
    if (userId) {
      orders = orders.sort((a, b) =>
        String((b as { created_at?: string }).created_at).localeCompare(String((a as { created_at?: string }).created_at))
      );
    }

    return NextResponse.json({ orders });
  } catch (e) {
    console.error("Orders fetch failed:", e);
    return NextResponse.json({ orders: [], error: e instanceof Error ? e.message : "Server error" });
  }
}

// ── PATCH — update order status ─────────────────────────────────────
export async function PATCH(req: Request) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    await updateDoc(doc(db, "orders", id), { status, updated_at: new Date().toISOString() });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Order update failed:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 500 });
  }
}
