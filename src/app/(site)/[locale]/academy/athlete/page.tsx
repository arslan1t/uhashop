"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAcademyAuth } from "@/store/academy";

/** Old static URL — bounces to the athlete's stable personal page
 *  (/academy/athlete/[id]) once logged in, or to login otherwise. */
export default function AthleteRedirectPage() {
  const { isLoggedIn, initialized, role, scope, refresh } = useAcademyAuth();
  const router = useRouter();

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!initialized) return;
    if (isLoggedIn && role === "athlete" && scope?.role === "athlete") {
      router.replace(`/academy/athlete/${scope.athlete.id}`);
    } else {
      router.replace("/academy/login");
    }
  }, [initialized, isLoggedIn, role, scope, router]);

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
    </div>
  );
}
