import { apiRequest } from "../../../lib/api-client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "agent" | "admin";
}

interface ApiResponse<T> {
  data: T;
  error: null;
  meta: unknown;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await apiRequest<ApiResponse<AuthUser>>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }
  );

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await apiRequest<ApiResponse<LoginResult>>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  localStorage.setItem("token", response.data.token);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiRequest<ApiResponse<AuthUser>>(
    "/auth/me",
    {
      method: "GET",
    }
  );

  return response.data;
};