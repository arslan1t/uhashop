"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { useProductOverrides } from "@/store/productOverrides";
import { useAuthStore } from "@/store/auth";
import { useProductVisibility } from "@/store/productVisibility";
import { useWishlist } from "@/store/wishlist";
import { FirestoreSync } from "./FirestoreSync";

function StoreHydration() {
  useEffect(() => {
    // Runs after client mount — localStorage is guaranteed available here
    useCartStore.getState().hydrate?.();
    useProductOverrides.getState().hydrate();
    useAuthStore.getState().hydrate();
    useProductVisibility.getState().hydrate();
    useWishlist.getState().hydrate?.();
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="uha-theme"
    >
      <StoreHydration />
      {/* Firestore listeners, mounted only on routes that read products/sets */}
      <FirestoreSync />
      {children}
    </ThemeProvider>
  );
}
