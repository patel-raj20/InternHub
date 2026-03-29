// ============================================================
// Super Admin Chatbot Page - Organization-wide assistant
// ============================================================

import React from "react";
import { ChatPageShell } from "@/components/chatbot/ChatPageShell";
import { ChatbotScope } from "@/components/chatbot/types";

/**
 * Super Admin Chatbot Page
 *
 * This page provides an organization-wide chatbot assistant.
 * Super Admins can query all data within their organization across all departments.
 *
 * TODO: Extract organizationId from session/context
 * For now, using placeholder values for demonstration.
 */
export default function SuperAdminChatbotPage() {
  // TODO: Replace with actual values from session/auth context
  const scope: ChatbotScope = {
    role: "super_admin",
    organizationId: "org-123", // Super admin has org-level access
    userId: "user-super-admin-789",
  };

  return <ChatPageShell scope={scope} />;
}
