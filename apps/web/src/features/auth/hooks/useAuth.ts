import { useEffect, useState } from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../api/auth.api";

import type { AuthUser } from "../api/auth.api";

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);

    try {
      const result = await loginUser(email, password);
      setUser(result.user);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    setError(null);

    try {
      return await registerUser(name, email, password);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
};