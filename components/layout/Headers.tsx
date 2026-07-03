"use client";

import type { ReactNode } from "react";
import { IconChevronLeft } from "@/components/ui/Icons";

interface FlowHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export function FlowHeader({ title, subtitle, onBack }: FlowHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border glass safe-top">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-primary-800 transition-colors active:bg-primary-50 touch-manipulation"
        >
          <IconChevronLeft />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-bold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
    </header>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <header className="px-5 pb-2 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
