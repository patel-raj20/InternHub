// ============================================================
// SuggestedPrompts - Quick prompt chips
// ============================================================

import React from "react";
import { SuggestedPrompt } from "@/components/chatbot/types";

interface SuggestedPromptsProps {
  prompts: SuggestedPrompt[];
  onSelect: (prompt: SuggestedPrompt) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  prompts,
  onSelect,
}) => {
  return (
    <div className="glass-card rounded-xl p-4 border border-slate-700/50">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Suggested Prompts
      </div>
      <div className="flex flex-col gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelect(prompt)}
            className="text-left text-xs p-3 rounded-lg bg-slate-700/40 hover:bg-indigo-600/30 border border-slate-600/50 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-200 transition-colors group"
          >
            <span className="mr-2">{prompt.icon}</span>
            <span className="group-hover:font-medium">{prompt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
