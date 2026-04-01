// ============================================================
// Admin Chatbot Page - Department-scoped assistant
// ============================================================

"use client";

import React from "react";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();

  const scope: ChatbotScope = {
    role: "admin",
    organizationId: session?.user?.organization_id,
    departmentId: session?.user?.department_id,
    userId: session?.user?.id,
  };

  return <ChatPageShell scope={scope} />;
}
