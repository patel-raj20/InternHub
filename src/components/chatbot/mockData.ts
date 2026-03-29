// ============================================================
// Mock Data - Seed Prompts, Tips, and Recent Conversations
// ============================================================

import { SuggestedPrompt, RecentConversation } from "@/components/chatbot/types";

// Admin-specific suggested prompts
export const ADMIN_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "1",
    label: "Show all interns in my department",
    icon: "👥",
  },
  {
    id: "2",
    label: "List department performance metrics",
    icon: "📊",
  },
  {
    id: "3",
    label: "Find interns by college",
    icon: "🎓",
  },
  {
    id: "4",
    label: "Show this month's new joiners",
    icon: "✨",
  },
  {
    id: "5",
    label: "Department budget summary",
    icon: "💰",
  },
];

// Super Admin-specific suggested prompts
export const SUPER_ADMIN_SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  {
    id: "1",
    label: "Organization-wide intern summary",
    icon: "🌍",
  },
  {
    id: "2",
    label: "Compare all departments by headcount",
    icon: "📈",
  },
  {
    id: "3",
    label: "List top performing departments",
    icon: "⭐",
  },
  {
    id: "4",
    label: "Show interns by location",
    icon: "📍",
  },
  {
    id: "5",
    label: "Organization metrics dashboard",
    icon: "📊",
  },
  {
    id: "6",
    label: "User management summary",
    icon: "👨‍💼",
  },
];

// Help tips (same for both roles)
export const HELP_TIPS = [
  "💡 Ask natural language questions about your data — no SQL needed.",
  "🔍 Results include generated SQL so you can learn and verify queries.",
  "⌨️ Press Enter to send, Shift+Enter for a new line.",
] as const;

// Mock recent conversations (will be replaced by localStorage or backend later)
export const MOCK_RECENT_CONVERSATIONS: RecentConversation[] = [
  {
    id: "conv-1",
    title: "Intern Overview",
    lastMessage: "Show all interns from MIT university",
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    messageCount: 5,
  },
  {
    id: "conv-2",
    title: "Department Stats",
    lastMessage: "List department performance metrics",
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    messageCount: 3,
  },
  {
    id: "conv-3",
    title: "Team Analysis",
    lastMessage: "Find interns by college",
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    messageCount: 8,
  },
];

/**
 * Get suggested prompts based on role
 */
export function getSuggestedPrompts(role: "admin" | "super_admin") {
  return role === "admin"
    ? ADMIN_SUGGESTED_PROMPTS
    : SUPER_ADMIN_SUGGESTED_PROMPTS;
}

/**
 * Format timestamp relative to now
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString();
}
