// ============================================================
// Super Admin Chatbot Page - Organization-wide assistant
// ============================================================

"use client";

import React from "react";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();

  const scope: ChatbotScope = {
    role: "super_admin",
    organizationId: session?.user?.organization_id,
    userId: session?.user?.id,
  };

  return <ChatPageShell scope={scope} />;
}
