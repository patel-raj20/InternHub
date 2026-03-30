// ============================================================
// RecentConversations - Recent chat previews
// ============================================================

import React from "react";
import { RecentConversation } from "@/components/chatbot/types";
import { formatRelativeTime } from "@/components/chatbot/mockData";

interface RecentConversationsProps {
  conversations: RecentConversation[];
  onSelect: (id: string) => void;
}

export const RecentConversations: React.FC<RecentConversationsProps> = ({
  conversations,
  onSelect,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="glass-card rounded-xl p-4 border border-slate-700/50">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Recent Conversations
        </div>
        <p className="text-xs text-slate-500">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-700/50">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Recent Conversations
      </div>
      <div className="flex flex-col gap-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className="text-left p-3 rounded-lg bg-slate-700/40 hover:bg-indigo-600/20 border border-slate-600/50 hover:border-indigo-500/30 transition-colors group text-xs"
          >
            <div className="font-medium text-slate-200 group-hover:text-indigo-300 line-clamp-1">
              {conv.title}
            </div>
            <div className="text-slate-400 text-xs mt-1 line-clamp-1">
              {conv.lastMessage}
            </div>
            <div className="text-slate-500 text-xs mt-2 flex justify-between">
              <span>{formatRelativeTime(conv.lastUpdated)}</span>
              <span>{conv.messageCount} messages</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
