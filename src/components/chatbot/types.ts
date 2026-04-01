// ============================================================
// ChatBot UI - Shared Type Contracts
// ============================================================

// Role-based scope definitions
export type ChatbotRole = "admin" | "super_admin";

// Scope context provided by parent route
export interface ChatbotScope {
  role: ChatbotRole;
  organizationId?: string;
  departmentId?: string;
  userId?: string;
}

// Single message in conversation
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  // Optional result block for assistant responses
  result?: ChatQueryResult;
}

// Query result from API
export interface ChatQueryResult {
  question: string;
  sql: string;
  columns: string[];
  results: Record<string, any>[];
}

// API Request to /api/v0/ask
export interface VannaAskRequest {
  question: string;
  role?: "DEPT_ADMIN" | "SUPER_ADMIN";
  organization_id?: string;
  department_id?: string;
}

// API Response from /api/v0/ask
export interface VannaAskResponse {
  question: string;
  sql: string;
  columns: string[];
  results: Record<string, any>[];
}

// Adapter result wrapper (success/error)
export interface AskResult {
  success: boolean;
  data?: VannaAskResponse;
  error?: {
    code: string;
    message: string;
  };
}

// UI state flags
export interface ChatUIState {
  isLoading: boolean;
  isDisabled: boolean;
  hasError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
}

// Suggested prompt item
export interface SuggestedPrompt {
  id: string;
  label: string;
  icon?: string;
}

// Recent conversation preview
export interface RecentConversation {
  id: string;
  title: string;
  lastMessage: string;
  lastUpdated: Date;
  messageCount: number;
}

// Component props types
export interface ChatPageShellProps {
  scope: ChatbotScope;
}

export interface ChatHeaderProps {
  title: string;
  isOnline: boolean;
  onNewChat: () => void;
  onClear: () => void;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  showResult?: boolean;
}

export interface ChatComposerProps {
  isDisabled: boolean;
  isLoading: boolean;
  onSubmit: (question: string) => void;
  onClear: () => void;
}

export interface ChatContextPanelProps {
  role: ChatbotRole;
  suggestedPrompts: SuggestedPrompt[];
  recentConversations: RecentConversation[];
  onPromptSelect: (prompt: SuggestedPrompt) => void;
  onConversationSelect: (id: string) => void;
  departmentName?: string;
  organizationName?: string;
}

export interface ChatScopeCardProps {
  role: ChatbotRole;
  departmentName?: string;
  organizationName?: string;
}

export interface ChatEmptyStateProps {
  role: ChatbotRole;
}

export interface ChatLoadingStateProps {
  message?: string;
}

export interface ChatErrorStateProps {
  error: string;
  onRetry: () => void;
}
