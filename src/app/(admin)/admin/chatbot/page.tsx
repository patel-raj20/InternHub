// ============================================================
// Admin Chatbot Page - Department-scoped assistant
// ============================================================

import React from "react";
import { ChatPageShell } from "@/components/chatbot/ChatPageShell";
import { ChatbotScope } from "@/components/chatbot/types";

/**
 * Admin Chatbot Page
 *
 * This page provides a department-scoped chatbot assistant.
 * Admins can only query data related to their assigned department.
 *
 * TODO: Extract organizationId and departmentId from session/context
 * For now, using placeholder values for demonstration.
 */
export default function AdminChatbotPage() {
  // TODO: Replace with actual values from session/auth context
  const scope: ChatbotScope = {
    role: "admin",
    organizationId: "org-123",
    departmentId: "dept-456", // Admin can only access their department
    userId: "user-789",
  };

  return <ChatPageShell scope={scope} />;
}
