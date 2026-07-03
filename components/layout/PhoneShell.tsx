"use client";

import type { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
  showStatusBar?: boolean;
}

export function PhoneShell({ children, showStatusBar = true }: PhoneShellProps) {
  return (
    <div className="min-h-dvh bg-surface-muted">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-white shadow-2xl shadow-primary-950/5">
        {showStatusBar && (
          <div className="safe-top flex h-11 shrink-0 items-end justify-center pb-1">
            <div className="h-1 w-28 rounded-full bg-slate-900/10" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
