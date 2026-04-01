// ============================================================
// ChatPageShell - Main orchestrator with state machine
// ============================================================

"use client";

import React, { useState, useCallback } from "react";
import { ChatPageShellProps, ChatMessage } from "@/components/chatbot/types";
import { askVanna } from "@/lib/chatbot/vanna-adapter";
import { ChatEmptyState } from "@/components/chatbot/ChatEmptyState";
import { ChatMessageList } from "@/components/chatbot/ChatMessageList";
import { ChatComposer } from "@/components/chatbot/ChatComposer";
import { ChatErrorState } from "@/components/chatbot/ChatErrorState";

export const ChatPageShell: React.FC<ChatPageShellProps> = ({ scope }) => {
  // State Management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine scope labels
  const roleLabel =
    scope.role === "admin"
      ? "Department scoped assistant"
      : "Organization wide assistant";

  const pageTitle = "InternHub Data Assistant";
  const isScopeReady = scope.role === "super_admin" || !!scope.departmentId;

  // Handlers

  /**
   * Send a question and get response
   */
  const handleSendQuestion = useCallback(
    async (question: string) => {
      if (!question.trim()) return;
      if (!isScopeReady) {
        setError("Waiting for your department scope. Please try again in a moment.");
        return;
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: question,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setError(null);
      setIsLoading(true);

      try {
        // Call Vanna API
        const result = await askVanna(question, scope);

        if (!result.success || !result.data) {
          throw new Error(result.error?.message || "Query failed");
        }

        // Add assistant message with result
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content:
            result.data.results.length > 0
              ? `Here are ${result.data.results.length} result(s) based on your question.`
              : "I could not find any matching records for your question.",
          timestamp: new Date(),
          result: {
            question: result.data.question,
            sql: result.data.sql,
            columns: result.data.columns,
            results: result.data.results,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMsg);

        // Add error message
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: `I encountered an error: ${errorMsg}`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [scope, isScopeReady]
  );

  /**
   * Clear conversation
   */
  const handleClear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * New chat (same as clear for now)
   */
  const handleNewChat = useCallback(() => {
    handleClear();
  }, [handleClear]);

  /**
   * Retry query (re-send last user message)
   */
  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");

    if (lastUserMessage) {
      // Remove failed response
      const lastAssistantIdx = messages.findIndex(
        (msg) => msg.id === lastUserMessage.id && msg.role === "user"
      );
      setMessages(messages.slice(0, lastAssistantIdx + 1));
      handleSendQuestion(lastUserMessage.content);
    }
  }, [messages, handleSendQuestion]);

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen bg-linear-to-b from-background via-background to-muted/30 text-foreground">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-5 md:px-8 md:py-7">
        <div className="glass-card mb-4 shrink-0 rounded-2xl border-border/60 px-5 py-4">
          <div className="mb-2 inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
            Vanna 2.0 Agent
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-foreground md:text-3xl">
                {pageTitle}
              </h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">{roleLabel}</p>
            </div>
            <button
              onClick={handleNewChat}
              className="rounded-xl border border-border/70 bg-background/70 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-foreground transition-all hover:border-primary/30 hover:bg-muted/50"
            >
              New chat
            </button>
          </div>
        </div>

        <div className="glass-card relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border-border/60">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-muted/40 to-transparent" />
          {isEmpty ? (
            <ChatEmptyState role={scope.role} />
          ) : (
            <ChatMessageList messages={messages} isLoading={isLoading} />
          )}

          {error && <ChatErrorState error={error} onRetry={handleRetry} />}
        </div>

        <ChatComposer
          isDisabled={!isScopeReady}
          isLoading={isLoading}
          onSubmit={handleSendQuestion}
          onClear={handleClear}
        />
      </div>
    </div>
  );
};
