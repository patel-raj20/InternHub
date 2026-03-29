// ============================================================
// ChatLoadingState - Assistant typing indicator
// ============================================================

import React from "react";
import { ChatLoadingStateProps } from "@/components/chatbot/types";

export const ChatLoadingState: React.FC<ChatLoadingStateProps> = ({
  message = "Thinking...",
}) => {
  return (
    <div className="flex items-end gap-3 px-4 py-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        AI
      </div>

      {/* Typing Bubble */}
      <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-sm max-w-xs">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
          <span className="text-xs text-slate-400">{message}</span>
        </div>
      </div>
    </div>
  );
};
