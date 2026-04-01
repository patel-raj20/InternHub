// ============================================================
// ChatComposer - Sticky input bar with multiline textarea
// ============================================================

import React, { useRef, useEffect, useState } from "react";
import { ChatComposerProps } from "@/components/chatbot/types";

export const ChatComposer: React.FC<ChatComposerProps> = ({
  isDisabled,
  isLoading,
  onSubmit,
  onClear,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(
        textareaRef.current.scrollHeight,
        120
      ) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isDisabled) {
      onSubmit(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setInput("");
    onClear();
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-transparent pb-1 pt-3">
      <div className="glass-card mx-auto flex w-full max-w-5xl gap-3 rounded-2xl border-border/60 p-2.5">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about interns, departments, or organizations..."
          disabled={isDisabled || isLoading}
          className="max-h-32 flex-1 resize-none rounded-xl border border-border/50 bg-muted/25 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
          rows={1}
        />

        <div className="flex items-end gap-2">
          <button
            onClick={handleSubmit}
            disabled={isDisabled || isLoading || !input.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-[11px] font-black uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/50 border-t-transparent" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <span>Send</span>
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={isDisabled || isLoading}
            className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="mt-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
        <span>Shift+Enter for newline</span>
      </div>
    </div>
  );
};
