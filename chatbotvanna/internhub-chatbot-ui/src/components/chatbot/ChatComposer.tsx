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
    <div className="sticky bottom-0 left-0 right-0 pt-3 pb-2 bg-white">
      <div className="rounded-2xl p-4 border border-slate-200 bg-white shadow-sm flex gap-3">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about interns, departments, or organizations..."
          disabled={isDisabled || isLoading}
          className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none resize-none max-h-32 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          rows={1}
        />

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={isDisabled || isLoading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg font-medium text-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin" />
                <span>Sending</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <span>↵</span>
              </>
            )}
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            disabled={isDisabled || isLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Keyboard Hint */}
      <div className="text-xs text-slate-400 mt-2 text-center">
        <span>⌨️ Shift+Enter for newline</span>
      </div>
    </div>
  );
};
