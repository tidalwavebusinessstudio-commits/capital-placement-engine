"use client";

import { DataProvider } from "@/lib/store/DataContext";
import { ToastProvider } from "@/lib/store/ToastContext";
import type { ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <DataProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </DataProvider>
  );
}
