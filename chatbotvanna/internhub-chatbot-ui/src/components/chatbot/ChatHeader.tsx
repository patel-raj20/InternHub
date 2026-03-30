// ============================================================
// ChatHeader - Top card with status and actions
// ============================================================

import React from "react";
import { ChatHeaderProps } from "@/components/chatbot/types";

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isOnline,
  onNewChat,
  onClear,
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 mb-4 flex items-center justify-between border border-slate-700/50">
      {/* Left: Status + Title */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full ${
              isOnline
                ? "bg-green-500 animate-pulse"
                : "bg-yellow-500 animate-pulse"
            }`}
          />
          <div
            className={`absolute inset-0 rounded-full animate-ping ${
              isOnline ? "bg-green-500/40" : "bg-yellow-500/40"
            }`}
          />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          <p className="text-xs text-slate-500">
            {isOnline ? "Online" : "Idle"}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 transition-colors font-medium"
        >
          New Chat
        </button>
        <button
          onClick={onClear}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
