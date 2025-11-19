// src/components/Providers.tsx
"use client";

import { ToastProvider } from "@/components/ToastProvider";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
      <ToastProvider>
        {children}
      </ToastProvider>
  );
}