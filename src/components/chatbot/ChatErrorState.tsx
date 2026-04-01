// ============================================================
// ChatErrorState - Retryable error alert
// ============================================================

import React from "react";
import { ChatErrorStateProps } from "@/components/chatbot/types";

export const ChatErrorState: React.FC<ChatErrorStateProps> = ({
  error,
  onRetry,
}) => {
  return (
    <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/8 p-4 md:mx-6">
      <div className="shrink-0 text-lg font-black text-destructive">!</div>

      <div className="flex-1">
        <p className="text-xs font-black uppercase tracking-wider text-destructive">Query failed</p>
        <p className="mt-1 text-xs text-destructive/90">{error}</p>
      </div>

      <button
        onClick={onRetry}
        className="whitespace-nowrap rounded-lg border border-destructive/40 bg-background/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/10"
      >
        Retry
      </button>
    </div>
  );
};
