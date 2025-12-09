// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  whatsapp?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;       // Initial auth check
  actionLoading: boolean; // For login/register/logout
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);        // Initial load
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  // Fetch current user — always try (401 means not authenticated)
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/users/profile/");
      setUser(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setUser(null);
      } else {
        console.error("Unexpected error fetching user:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Token refresh (only on protected pages if needed)
  const refreshToken = useCallback(async () => {
    try {
      await api.post("/users/token/refresh/");
    } catch (err) {
      console.warn("Token refresh failed");
      await logout(); // Force logout on refresh failure
    }
  }, []);

  // Axios 401 interceptor with retry
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          await refreshToken();
          return api(originalRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  const login = async (email: string, password: string) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await api.post("/users/login/", { email, password });
      await fetchUser(); // Refresh user data after login
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        "Invalid credentials. Please try again.";
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const register = async (data: any) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await api.post("/users/register/", data);
      await login(data.email, data.password);
    } catch (err: any) {
      const errors = err.response?.data;
      let message = "Registration failed. Please try again.";
      if (errors) {
        message =
          errors.email?.[0] ||
          errors.whatsapp?.[0] ||
          errors.password?.[0] ||
          (typeof errors === "string" ? errors : message);
      }
      throw new Error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const logout = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await api.post("/users/logout/", {});
    } catch (err) {
      console.warn("Logout request failed (continuing anyway)");
    } finally {
      setUser(null);
      setActionLoading(false);
      router.replace("/auth/login");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    actionLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};