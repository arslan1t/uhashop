import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendTelegramMessage, escapeHtml } from "@/lib/telegram";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase not configured");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// ── Telegram notification ───────────────────────────────────────────
async function sendTelegramNotification(order: {
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
  try {
    const body = await req.json();
    const {
      items,
      total,
      customer_name,
      telegram,
      phone,
      city,
      address,
      notes,
      promo_code,
      discount,
      user_id,
    } = body;

    if (!items?.length || !customer_name || !telegram || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

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
      shipping_address: {
        name: customer_name,
        telegram,
        phone,
        city,
        address,
        notes,
      },
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error("Supabase order insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send Telegram notification (non-blocking)
    sendTelegramNotification({
      order_number: orderNumber,
      customer_name,
      telegram,
      phone,
      city,
      address,
      items,
      total,
      promo_code,
      discount,
      notes,
    }).catch(console.error);

    return NextResponse.json({ ok: true, order: data });
  } catch (e) {
    console.error("Order creation failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── GET — list orders ───────────────────────────────────────────────
export async function GET(req: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase orders fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (e) {
    console.error("Orders fetch failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── PATCH — update order status ─────────────────────────────────────
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase order update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, order: data });
  } catch (e) {
    console.error("Order update failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
