const API_BASE_URL = "/api/v1";
const ACCESS_TOKEN_KEY = "learnhub:access-token";

export type ApiUser = {
  id: number;
  full_name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  is_active: boolean;
  profile_picture_url?: string | null;
  instructor_status?: "pending" | "approved" | "rejected" | null;
  instructor_rejection_reason?: string | null;
};

type ApiErrorBody = {
  detail?: unknown;
  message?: unknown;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  try {
    return (
      window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
      window.localStorage.getItem(ACCESS_TOKEN_KEY)
    );
  } catch {
    throw new Error("Unable to access the sign-in session in this browser.");
  }
}

export function setAccessToken(token: string | null, remember = false) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    if (token) {
      const storage = remember ? window.localStorage : window.sessionStorage;
      storage.setItem(ACCESS_TOKEN_KEY, token);
    }
  } catch {
    throw new Error("Unable to store the sign-in session in this browser.");
  }
}

function getApiErrorMessage(data: unknown, status: number) {
  if (typeof data === "string" && data.trim()) return data.trim();

  if (typeof data === "object" && data !== null) {
    const body = data as ApiErrorBody;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      const messages = body.detail.flatMap((issue) => {
        if (
          typeof issue === "object" &&
          issue !== null &&
          "msg" in issue &&
          typeof issue.msg === "string"
        ) {
          return [issue.msg];
        }
        return [];
      });
      if (messages.length > 0) return messages.join(" ");
    }
    if (typeof body.message === "string") return body.message;
  }

  return `Request failed (${status}). Please try again.`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (typeof options.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return undefined as T;

  const responseText = await response.text();
  let data: unknown = null;
  if (responseText) {
    try {
      data = JSON.parse(responseText) as unknown;
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiRequestError(getApiErrorMessage(data, response.status), response.status);
  }

  return data as T;
}
