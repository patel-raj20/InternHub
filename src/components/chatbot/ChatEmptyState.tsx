// ============================================================
// ChatEmptyState - Initial empty conversation UI
// ============================================================

import React from "react";
import { ChatEmptyStateProps } from "@/components/chatbot/types";

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ role }) => {
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden px-5 py-12 md:px-10">
      <div className="pointer-events-none absolute top-1/2 h-32 w-sm -translate-y-1/2 rounded-full bg-primary/8 blur-3xl" />

      <div className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-background/70 px-8 py-8 text-center backdrop-blur-xl">
        <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-black tracking-[0.12em] text-primary ring-1 ring-primary/20">
          AI
        </div>

        <h2 className="text-2xl font-black tracking-tighter text-foreground">
          Clear answers, instantly.
        </h2>

        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Ask about {role === "admin" ? "department" : "organization"} data in plain English and receive SQL-backed responses you can trust.
        </p>

        <div className="mx-auto mt-6 h-px w-20 bg-border" />

        <p className="mt-3.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground/80">
          Press Enter to send. Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
};
