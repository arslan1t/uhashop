/**
 * POST /api/auth/telegram
 *
 * Verifies Telegram Login Widget data server-side using HMAC-SHA256.
 *
 * Flow:
 *   1. Frontend receives auth data from Telegram widget callback
 *   2. Sends it here via fetch POST
 *   3. Server verifies hash with bot token (never exposed to client)
 *   4. Returns JWT session token or error
 *
 * Telegram docs: https://core.telegram.org/widgets/login#checking-authorization
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

function verifyTelegramHash(data: TelegramAuthData): boolean {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || botToken === "your_bot_token_here") {
    // Dev mode: skip verification if token not set
    console.warn("[TG Auth] Bot token not configured — skipping hash verification (dev only)");
    return true;
  }

  const { hash, ...rest } = data;

  // Build data-check-string: sorted key=value pairs joined by \n
  const dataCheckString = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  // Secret key = SHA256(bot_token)
  const secretKey = crypto
    .createHash("sha256")
    .update(botToken)
    .digest();

  // Compute HMAC-SHA256
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return computedHash === hash;
}

function checkAuthDate(authDate: number): boolean {
  const MAX_AGE_SECONDS = 86_400; // 24 hours
  const now = Math.floor(Date.now() / 1000);
  return now - authDate <= MAX_AGE_SECONDS;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TelegramAuthData;

    // 1. Validate required fields
    if (!body.id || !body.first_name || !body.auth_date || !body.hash) {
      return NextResponse.json(
        { error: "Missing required Telegram auth fields" },
        { status: 400 }
      );
    }

    // 2. Check auth_date is recent
    if (!checkAuthDate(body.auth_date)) {
      return NextResponse.json(
        { error: "Auth data is too old. Please try again." },
        { status: 401 }
      );
    }

    // 3. Verify hash
    if (!verifyTelegramHash(body)) {
      return NextResponse.json(
        { error: "Invalid Telegram auth hash. Data may be tampered." },
        { status: 401 }
      );
    }

    // 4. Auth valid — build user profile
    const user = {
      id: `tg_${body.id}`,
      telegramId: body.id,
      name: [body.first_name, body.last_name].filter(Boolean).join(" "),
      username: body.username ? `@${body.username}` : undefined,
      avatar: body.photo_url ?? null,
      authMethod: "telegram" as const,
      verifiedAt: new Date().toISOString(),
    };

    // 5. Return verified user (in production: create JWT + set httpOnly cookie)
    return NextResponse.json({ ok: true, user });

  } catch (err) {
    console.error("[TG Auth] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
