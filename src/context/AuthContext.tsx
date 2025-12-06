"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    password_confirm: string;
    whatsapp: string;
    first_name: string;
    last_name: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Global axios instance with refresh logic
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Silent token refresh
  const refreshToken = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await api.post("/users/token/refresh/");
      // Refresh successful — no new tokens needed, cookies updated
    } catch (err: any) {
      console.warn("Refresh token expired or invalid");
      logout();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Interceptor: Auto-refresh on 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          await refreshToken();

          // Retry the original request
          return api(originalRequest);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/profile/");
      setUser(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    await api.post("/users/login/", { email, password });
    await fetchUser();
    router.push("/dashboard");
  };

  const register = async (data: {
    email: string;
    password: string;
    password_confirm: string;
    whatsapp: string;
    first_name: string;
    last_name: string;
  }) => {
    await api.post("/users/register/", data);
    await login(data.email, data.password);
  };

  const logout = async () => {
    try {
      await api.post("/users/logout/", {});
    } catch (err) {
      console.warn("Logout failed");
    }
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};