"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FlowHeader } from "@/components/layout/Headers";
import { getOpeningLine } from "@/lib/mockAi";
import { LANGUAGE_LABELS, SCENARIOS } from "@/lib/scenarios";
import type { Language, ScenarioId } from "@/lib/types";

interface ConversationScreenProps {
  language: Language;
  scenarioId: ScenarioId;
  onBack: () => void;
  onSubmit: (userText: string) => void;
}

export function ConversationScreen({
  language,
  scenarioId,
  onBack,
  onSubmit,
}: ConversationScreenProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const langInfo = LANGUAGE_LABELS[language];
  const openingLine = getOpeningLine(language, scenarioId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    await new Promise((r) => setTimeout(r, 500));
    onSubmit(input.trim());
    setIsSending(false);
  };

  return (
    <div className="flex flex-1 flex-col">
      <FlowHeader
        title={scenario.title}
        subtitle={`${langInfo.flag} ${langInfo.label}`}
        onBack={onBack}
      />

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-surface-muted px-3 py-1 text-[10px] font-medium text-slate-400">
            Practice session started
          </span>
        </div>

        <div className="space-y-4">
          <MessageBubble
            role="ai"
            name="AI Coach"
            text={openingLine}
            delay={0}
          />
        </div>
      </div>

      {/* Input area — iPhone-style bottom bar */}
      <div className="border-t border-surface-border bg-white px-4 py-3 safe-bottom">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder={
                language === "german"
                  ? "Antwort auf Deutsch…"
                  : "Type your reply…"
              }
              className="flex-1 resize-none rounded-2xl border border-surface-border bg-surface-muted px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Button
            type="submit"
            fullWidth
            disabled={!input.trim() || isSending}
            className="mt-3"
            size="md"
          >
            {isSending ? "Analyzing…" : "Submit for feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  name,
  text,
  delay,
}: {
  role: "ai" | "user";
  name: string;
  text: string;
  delay: number;
}) {
  const isAi = role === "ai";

  return (
    <div
      className={`flex animate-fade-in-up ${isAi ? "justify-start" : "justify-end"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`max-w-[88%] ${isAi ? "" : "order-1"}`}>
        {isAi && (
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800">
              <span className="text-[10px] font-bold text-white">Z</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">{name}</span>
          </div>
        )}
        <div
          className={`rounded-3xl px-4 py-3 ${
            isAi
              ? "rounded-tl-lg bg-surface-muted text-slate-800"
              : "rounded-tr-lg bg-primary-800 text-white"
          }`}
        >
          <p className="text-[15px] leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

export { MessageBubble };
