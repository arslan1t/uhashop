"use client";

import { usePathname } from "@/i18n/navigation";
import { useFirestoreProducts } from "@/hooks/useFirestoreProducts";
import { useFirestoreSets } from "@/hooks/useFirestoreSets";

/**
 * Mounts the Firestore real-time subscriptions only on the routes that read
 * products or player sets.
 *
 * These hooks open five onSnapshot listeners and pull the whole shop_products
 * collection. They used to run from Providers, so every page — cart, checkout,
 * academy, league, the auth screens — downloaded the entire catalogue and
 * carried the Firebase SDK for data it never rendered.
 *
 * Keep this list in sync with the components that read useCustomProducts /
 * usePlayerSets. Adding a route is cheap; forgetting one means that page shows
 * stale localStorage data until a visit to a synced route.
 */
const SYNCED_ROUTES = [
  "/",             // home — FeaturedProducts
  "/marketplace",  // grid + player sets (and /marketplace/player-sets/[id])
  "/product",      // product page — CustomProductFallback
  "/profile",      // own profile and /profile/[userId] — sets
];

function Subscriptions() {
  useFirestoreProducts();
  useFirestoreSets();
  return null;
}

export function FirestoreSync() {
  // Locale-stripped path, e.g. "/marketplace/player-sets/abc".
  const pathname = usePathname();
  const needsSync = SYNCED_ROUTES.some(r =>
    r === "/" ? pathname === "/" : pathname === r || pathname.startsWith(`${r}/`)
  );

  // Hooks can't be called conditionally, so the gate is a separate component
  // that is mounted or not — unmounting it also closes the listeners.
  return needsSync ? <Subscriptions /> : null;
}
