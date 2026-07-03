"use client";

import { TABS } from "@/lib/navigation";
import type { TabId } from "@/lib/navigation";
import { TAB_ICONS } from "@/components/ui/Icons";

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hidden?: boolean;
}

export function BottomNav({ activeTab, onTabChange, hidden }: BottomNavProps) {
  if (hidden) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-surface-border glass safe-bottom"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-3 px-2 pb-1 pt-2">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 transition-colors touch-manipulation ${
                isActive ? "text-primary-800" : "text-slate-400 active:text-primary-600"
              }`}
            >
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-all ${
                  isActive ? "bg-primary-100" : ""
                }`}
              >
                <Icon className="h-[22px] w-[22px]" />
              </span>
              <span className="text-[10px] font-semibold tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
