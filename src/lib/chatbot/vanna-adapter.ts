// ============================================================
// Vanna API Adapter - Wraps POST /api/v0/ask
// ============================================================

import { VannaAskRequest, VannaAskResponse, AskResult } from "@/components/chatbot/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || "http://localhost:8000";
const ASK_ENDPOINT = `${API_BASE_URL}/api/v0/ask`;

/**
 * Calls the Vanna /api/v0/ask endpoint with natural language question
 * @param question Natural language question
 * @returns AskResult with data or error
 */
export async function askVanna(question: string): Promise<AskResult> {
  if (!question?.trim()) {
    return {
      success: false,
      error: {
        code: "EMPTY_QUESTION",
        message: "Question cannot be empty",
      },
    };
  }

  try {
    const payload: VannaAskRequest = { question };

    const response = await fetch(ASK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.detail || `HTTP ${response.status}`);
    }

    const data: VannaAskResponse = await response.json();

    // Validate response shape
    if (
      !data ||
      typeof data.question !== "string" ||
      typeof data.sql !== "string" ||
      !Array.isArray(data.columns) ||
      !Array.isArray(data.results)
    ) {
      throw new Error("Invalid response shape from API");
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: {
        code: "API_ERROR",
        message,
      },
    };
  }
}

/**
 * Health check for backend availability
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get config from backend
 */
export async function getConfig(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v0/config`);
    if (!response.ok) throw new Error("Config fetch failed");
    return await response.json();
  } catch (err) {
    return null;
  }
}
