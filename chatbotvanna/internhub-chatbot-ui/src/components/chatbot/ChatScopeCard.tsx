// ============================================================
// ChatScopeCard - Role scope display (department vs org/global)
// ============================================================

import React from "react";
import { ChatScopeCardProps } from "@/components/chatbot/types";

export const ChatScopeCard: React.FC<ChatScopeCardProps> = ({
  role,
  departmentName,
  organizationName,
}) => {
  const isAdmin = role === "admin";

  return (
    <div className="glass-card rounded-xl p-4 border border-slate-700/50">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        Scope
      </div>
      {isAdmin ? (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/30 rounded-lg border border-indigo-500/50">
          <span className="text-xs">📁</span>
          <span className="text-xs font-medium text-indigo-200">
            {departmentName || "Department"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600/30 rounded-lg border border-purple-500/50 w-fit">
            <span className="text-xs">🌍</span>
            <span className="text-xs font-medium text-purple-200">
              {organizationName || "Organization"}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700/40 rounded-lg border border-slate-600/50 w-fit">
            <span className="text-xs">🔓</span>
            <span className="text-xs font-medium text-slate-300">
              All Departments
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
