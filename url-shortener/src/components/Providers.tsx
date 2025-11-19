// src/components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ToastProvider";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}