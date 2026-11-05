import { apiRequest, getAccessToken, setAccessToken } from "@/lib/api";

type AuthPayload = {
  email: string;
  password: string;
  full_name?: string;
};

type AuthResponse = {
  access_token: string;
  token_type: string;
  user?: {
    role: string;
  };
};

export function clearAccessToken() {
  setAccessToken(null);
}

export { getAccessToken };

export async function authenticate(
  mode: "login" | "register",
  payload: AuthPayload,
  remember = false,
) {
  if (mode === "register") {
    return apiRequest<{ id: number; email: string; role: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          full_name: payload.full_name,
          email: payload.email,
          password: payload.password,
        }),
      },
    );
  }

  const form = new URLSearchParams({
    username: payload.email,
    password: payload.password,
  });
  const response = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: form,
  });

  if (!response.access_token) {
    throw new Error("The server did not return an access token.");
  }

  setAccessToken(response.access_token, remember);

  try {
    const user = await apiRequest<{ role: string }>("/auth/me");
    return { ...response, user };
  } catch (error) {
    clearAccessToken();
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  return apiRequest<void>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiRequest<void>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}
