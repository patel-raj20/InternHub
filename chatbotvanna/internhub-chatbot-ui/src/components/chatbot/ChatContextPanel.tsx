// ============================================================
// ChatContextPanel - Right-side context cards (responsive)
// ============================================================

import React from "react";
import { ChatContextPanelProps } from "@/components/chatbot/types";
import { SuggestedPrompts } from "@/components/chatbot/SuggestedPrompts";
import { RecentConversations } from "@/components/chatbot/RecentConversations";
import { ChatScopeCard } from "@/components/chatbot/ChatScopeCard";

export const ChatContextPanel: React.FC<ChatContextPanelProps> = ({
  role,
  suggestedPrompts,
  recentConversations,
  onPromptSelect,
  onConversationSelect,
  departmentName,
  organizationName,
}) => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      {/* Scope Card */}
      <ChatScopeCard
        role={role}
        departmentName={departmentName}
        organizationName={organizationName}
      />

      {/* Suggested Prompts */}
      <SuggestedPrompts
        prompts={suggestedPrompts}
        onSelect={onPromptSelect}
      />

      {/* Recent Conversations */}
      <RecentConversations
        conversations={recentConversations}
        onSelect={onConversationSelect}
      />

      {/* Help Tips */}
      <div className="glass-card rounded-xl p-4 border border-slate-700/50">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Tips
        </div>
        <div className="space-y-2">
          <p className="text-xs text-slate-400 leading-relaxed">
            💡 Ask natural language questions with no SQL needed.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            🔍 Results include generated SQL for verification.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            ⌨️ Use Shift+Enter for multi-line prompts.
          </p>
        </div>
      </div>
    </div>
  );
};
