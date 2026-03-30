// ============================================================
// ChatPageShell - Main orchestrator with state machine
// ============================================================

"use client";

import React, { useState, useCallback } from "react";
import { ChatPageShellProps, ChatMessage, SuggestedPrompt } from "@/components/chatbot/types";
import { askVanna } from "@/lib/chatbot/vanna-adapter";
import {
  getSuggestedPrompts,
} from "@/components/chatbot/mockData";
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
      ? "Department-scoped assistant"
      : "Organization-wide assistant";

  const pageTitle = "InternHub Data Assistant";

  // Handlers

  /**
   * Send a question and get response
   */
  const handleSendQuestion = useCallback(
    async (question: string) => {
      if (!question.trim()) return;

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
        const result = await askVanna(question);

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
    []
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
    <div className="h-screen bg-white text-slate-900">
      <div className="mx-auto h-full w-full max-w-6xl flex flex-col px-4 md:px-8 py-6">
        <div className="shrink-0 mb-4">
          <div className="mb-4">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
              Vanna 2.0 Agent
            </p>
            <h1 className="text-4xl font-bold text-slate-900 mb-1">
              {pageTitle}
            </h1>
            <p className="text-sm text-slate-500">{roleLabel}</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isEmpty ? (
            <ChatEmptyState role={scope.role} />
          ) : (
            <ChatMessageList messages={messages} isLoading={isLoading} />
          )}

          {error && <ChatErrorState error={error} onRetry={handleRetry} />}
        </div>

        <ChatComposer
          isDisabled={false}
          isLoading={isLoading}
          onSubmit={handleSendQuestion}
          onClear={handleClear}
        />
      </div>
    </div>
  );
};
