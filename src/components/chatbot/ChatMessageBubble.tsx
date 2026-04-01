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
      className={`mb-5 flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-primary/10 text-[10px] font-black tracking-wide text-primary">
          AI
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start w-full"}`}>
        <div
          className={`max-w-[78%] rounded-2xl px-4 py-3 ${
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground shadow-sm"
              : "rounded-bl-sm border border-border/60 bg-background/70 text-foreground"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        <p className="mt-1 px-2 text-xs text-muted-foreground/80">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {!isUser && result && showResult && (
          <div className="mt-3.5 w-full max-w-none lg:max-w-4xl">
            <div className="mb-3 rounded-xl border border-border/60 bg-muted/25 p-3.5">
              <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Generated PostgreSQL Query</span>
                <span className="text-[10px]">Vanna 2.0</span>
              </div>
              <code className="font-mono text-xs text-foreground break-all whitespace-pre-wrap">
                {result.sql}
              </code>
            </div>

            {firstRow && (
              <div className="mb-3 rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
                Top result preview: {Object.entries(firstRow)
                  .slice(0, 3)
                  .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v ?? "-"}`)
                  .join(" | ")}
              </div>
            )}

            <div className="mb-3 overflow-x-auto rounded-xl border border-border/60 bg-background/80">
              {result.results.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                  No records found in database.
                </div>
              ) : (
                <table className="w-full min-w-140 text-xs">
                  <thead>
                    <tr className="bg-muted/30 text-muted-foreground">
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left font-black uppercase tracking-widest"
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
                        className="border-t border-border/50 text-foreground"
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

            <div className="rounded-md border border-border/60 bg-muted/25 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium">Returned {result.results.length} row(s)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};