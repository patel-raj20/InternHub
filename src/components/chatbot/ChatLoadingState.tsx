// ============================================================
// ChatLoadingState - Assistant typing indicator
// ============================================================

import React from "react";
import { ChatLoadingStateProps } from "@/components/chatbot/types";

export const ChatLoadingState: React.FC<ChatLoadingStateProps> = ({
  message = "Thinking...",
}) => {
  return (
    <div className="flex items-end gap-3 px-1 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-primary/10 text-[10px] font-black text-primary">
        AI
      </div>

      <div className="max-w-xs rounded-2xl rounded-bl-sm border border-border/60 bg-muted/25 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70" />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{message}</span>
        </div>
      </div>
    </div>
  );
};
