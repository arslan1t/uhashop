/**
 * Centralized Telegram notification helper.
 * Sends all admin notifications (orders, academy, league) to a single chat.
 *
 * Env vars (set in Vercel):
 *   TELEGRAM_BOT_TOKEN — bot token from @BotFather
 *   TELEGRAM_CHAT_ID   — chat id / channel id to receive notifications
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Support both names for backwards compatibility
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

export function isTelegramConfigured(): boolean {
  return !!(BOT_TOKEN && CHAT_ID);
}

/**
 * Send a Telegram message to the admin chat.
 * Non-throwing: logs errors but never rejects, so it can be fire-and-forget.
 */
export async function sendTelegramMessage(
  text: string,
  opts: { parseMode?: "HTML" | "Markdown" } = {}
): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("[telegram] not configured — skipping notification");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: opts.parseMode ?? "HTML",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const body = await res.text();
      console.error("[telegram] send failed:", res.status, body);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[telegram] send error:", e);
    return false;
  }
}

/** Escape text for HTML parse mode. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
