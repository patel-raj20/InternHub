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
    <div className="mx-4 mt-4 p-4 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-3">
      {/* Error Icon */}
      <div className="text-red-400 text-xl flex-shrink-0">⚠️</div>

      {/* Error Content */}
      <div className="flex-1">
        <p className="text-sm text-red-300 font-medium">Query failed</p>
        <p className="text-xs text-red-400/70 mt-1">{error}</p>
      </div>

      {/* Retry Button */}
      <button
        onClick={onRetry}
        className="text-xs px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md transition-colors font-medium whitespace-nowrap"
      >
        Retry
      </button>
    </div>
  );
};
