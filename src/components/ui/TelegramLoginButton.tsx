"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface Props {
  redirectTo?: string;
  label?: string;
  size?: "large" | "medium" | "small";
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function TelegramLoginButton({
  redirectTo = "/profile",
  size = "large",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const handleAuth = useCallback(
    async (tgUser: TelegramUser) => {
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tgUser),
        });

        const data = await res.json();

        if (data.ok && data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: `${tgUser.id}@telegram.local`,
            telegram: data.user.username,
            avatar: data.user.avatar || undefined,
            createdAt: data.user.verifiedAt,
          });
          router.replace(redirectTo);
        }
      } catch (e) {
        console.error("Telegram auth failed:", e);
      }
    },
    [setUser, router, redirectTo]
  );

  useEffect(() => {
    window.onTelegramAuth = handleAuth;

    if (containerRef.current) {
      const botUsername =
        process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "uhashopbot";

      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", botUsername);
      script.setAttribute("data-size", size);
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      script.setAttribute("data-userpic", "true");
      script.setAttribute("data-corner-radius", "14");

      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [handleAuth, size]);

  return <div ref={containerRef} className="flex justify-center" />;
}
