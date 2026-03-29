// ============================================================
// ChatMessageList - Scrollable message timeline
// ============================================================

import React, { useEffect, useRef } from "react";
import { ChatMessageListProps } from "@/components/chatbot/types";
import { ChatMessageBubble } from "@/components/chatbot/ChatMessageBubble";
import { ChatLoadingState } from "@/components/chatbot/ChatLoadingState";

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
    >
      {/* Messages */}
      {messages.map((msg, idx) => (
        <ChatMessageBubble
          key={msg.id}
          message={msg}
          showResult={msg.role === "assistant"}
        />
      ))}

      {/* Loading State */}
      {isLoading && <ChatLoadingState message="Generating response..." />}

      {/* Scroll hint (only when not at bottom) */}
      {messages.length > 0 && (
        <div className="text-center text-xs text-slate-600 py-4">
          {/* Spacer */}
        </div>
      )}
    </div>
  );
};
