// ============================================================
// ChatMessageBubble - User/Assistant message styling
// ============================================================

import React from "react";
import { ChatMessageBubbleProps } from "@/components/chatbot/types";

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  showResult = true,
}) => {
  const isUser = message.role === "user";
  const result = message.result;
  const firstRow = result && result.results.length > 0 ? result.results[0] : null;

  return (
    <div
      className={`flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          AI
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start w-full"}`}>
        <div
          className={`px-4 py-3 rounded-2xl max-w-xs ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        <p className="text-xs text-slate-400 mt-1 px-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {!isUser && result && showResult && (
          <div className="mt-4 w-full max-w-none lg:max-w-4xl">
            <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-200 border-l-4 border-indigo-500">
              <div className="text-xs font-semibold text-indigo-600 mb-2 flex justify-between">
                <span>Generated PostgreSQL Query</span>
                <span className="text-slate-400 text-xs">Vanna 2.0</span>
              </div>
              <code className="text-xs text-slate-700 font-mono break-all whitespace-pre-wrap">
                {result.sql}
              </code>
            </div>

            {firstRow && (
              <div className="mb-3 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                Top result preview: {Object.entries(firstRow)
                  .slice(0, 3)
                  .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v ?? "-"}`)
                  .join(" | ")}
              </div>
            )}

            <div className="mb-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              {result.results.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-500 text-center">
                  No records found in database.
                </div>
              ) : (
                <table className="w-full min-w-[560px] text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500">
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className="text-left px-3 py-2 uppercase tracking-wide font-semibold"
                        >
                          {col.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-t border-slate-200 text-slate-700"
                      >
                        {result.columns.map((col) => (
                          <td key={`${rowIdx}-${col}`} className="px-3 py-2 align-top">
                            {row[col] === null || row[col] === undefined
                              ? "-"
                              : String(row[col])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
              <span className="font-medium">Returned {result.results.length} row(s)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};