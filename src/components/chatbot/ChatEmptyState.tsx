// ============================================================
// ChatEmptyState - Initial empty conversation UI
// ============================================================

import React from "react";
import { ChatEmptyStateProps } from "@/components/chatbot/types";

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ role }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-16">
      {/* Search Icon */}
      <div className="mb-4 text-6xl opacity-30">🔍</div>

      {/* Main Message */}
      <h2 className="text-xl font-semibold text-slate-100 mb-3">
        Intelligence is waiting
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-slate-400 mb-8 max-w-xs">
        Ask your first question about{" "}
        {role === "admin" ? "your department" : "your organization"}
      </p>

      {/* Example Prompt */}
      <div className="text-xs text-slate-500 bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50">
        Try: "Show all interns from MIT university"
      </div>
    </div>
  );
};
