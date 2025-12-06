"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";

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

// Global axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Public paths — NO auth check or refresh attempts here
const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Critical: detect current route

  const isPublicPage = () => {
    return PUBLIC_PATHS.some(path => pathname?.startsWith(path));
  };

  const fetchUser = async () => {
    // Skip everything on public pages
    if (isPublicPage()) {
      setUser(null);
      setLoading(false);
      return;
    }

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

  // Only run auth check if NOT on public page
  useEffect(() => {
    fetchUser();
  }, [pathname]); // Re-run when route changes

  // Silent refresh only when needed
  const refreshToken = async () => {
    if (isPublicPage()) return;
    try {
      await api.post("/users/token/refresh/");
    } catch (err: any) {
      console.warn("Refresh failed — logging out");
      logout();
    }
  };

  // Axios interceptor — skip refresh on public pages
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isPublicPage()
        ) {
          originalRequest._retry = true;
          await refreshToken();
          return api(originalRequest);
        }

        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [pathname]);

  const login = async (email: string, password: string) => {
    console.log("Login successful", email, password);
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