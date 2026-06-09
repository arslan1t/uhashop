/**
 * Orders API — backed by Firestore via Firebase Admin SDK.
 * Also sends a Telegram notification to the admin on new orders.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";
import { buildAdminToken } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

// ── Telegram notification ────────────────────────────────────────────────────
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

// ── POST — create order ──────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items, total, customer_name, telegram, phone, city, address,
      notes, promo_code, discount, user_id,
    } = body as Record<string, unknown>;

    if (!Array.isArray(items) || !items.length || !customer_name || !telegram || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now     = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand    = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `UHA-${dateStr}-${rand}`;

    const orderData = {
      order_number:     orderNumber,
      user_id:          user_id ?? null,
      items,
      total,
      status:           "new",
      promo_code:       promo_code ?? null,
      discount:         discount ?? 0,
      shipping_address: {
        name:    customer_name,
        telegram,
        phone:   phone ?? null,
        city,
        address: address ?? null,
        notes:   notes ?? null,
      },
      created_at: now.toISOString(),
    };

    const db     = getAdminDb();
    const docRef = await db.collection("orders").add(orderData);

    // Non-blocking Telegram notification
    sendOrderNotification({
      order_number: orderNumber,
      customer_name: String(customer_name),
      telegram:     String(telegram),
      phone:        phone ? String(phone) : undefined,
      city:         String(city),
      address:      address ? String(address) : undefined,
      items:        items as { name: string; size: string; qty: number; price: number }[],
      total:        Number(total),
      promo_code:   promo_code ? String(promo_code) : undefined,
      discount:     discount ? Number(discount) : undefined,
      notes:        notes ? String(notes) : undefined,
    }).catch(console.error);

    return NextResponse.json({ ok: true, order: { id: docRef.id, ...orderData } });
  } catch (e) {
    console.error("Order creation failed:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}

// ── GET — list orders (user_id scoped OR admin token) ────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId     = searchParams.get("user_id");
    const adminToken = req.headers.get("x-admin-token") ?? "";
    const isAdmin    = adminToken && adminToken === buildAdminToken();

    if (!userId && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db   = getAdminDb();
    const col  = db.collection("orders");
    const snap = userId
      ? await col.where("user_id", "==", userId).orderBy("created_at", "desc").get()
      : await col.orderBy("created_at", "desc").get();

    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ orders });
  } catch (e) {
    console.error("Orders fetch failed:", e);
    return NextResponse.json({ orders: [], error: String(e) });
  }
}

// ── PATCH — update order status ──────────────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const body           = await req.json();
    const { id, status } = body as { id?: string; status?: string };

    if (!id || !status) {
      return NextResponse.json({ error: "Missing id or status" }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("orders").doc(id).update({
      status,
      updated_at: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Order update failed:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
