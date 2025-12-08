// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  whatsapp?: string;
  // add more fields as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;        // initial app load
  actionLoading: boolean;  // login/register/logout in progress
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);           // initial load
  const [actionLoading, setActionLoading] = useState(false); // login/register/logout

  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const isPublicPage = useCallback(() => {
    return PUBLIC_PATHS.some((path) => pathname?.startsWith(path));
  }, [pathname]);

  const fetchUser = useCallback(async () => {
    if (isPublicPage()) {
      if (isMounted.current) {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    try {
      const res = await api.get("/users/profile/");
      if (isMounted.current) setUser(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        if (isMounted.current) setUser(null);
      } else {
        console.error("Failed to fetch user:", err);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [isPublicPage]);

  // Initial auth check
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Token refresh logic (only on protected pages)
  const refreshToken = async () => {
    if (isPublicPage()) return;
    try {
      await api.post("/users/token/refresh/");
    } catch (err) {
      console.warn("Token refresh failed");
      if (isMounted.current) logout();
    }
  };

  // Axios 401 interceptor with retry
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

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [isPublicPage]);

  const login = async (email: string, password: string) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await api.post("/users/login/", { email, password });
      await fetchUser();
      router.push("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        "Invalid credentials. Please try again.";
      throw new Error(message);
    } finally {
      if (isMounted.current) setActionLoading(false);
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
        if (errors.email) message = errors.email[0];
        else if (errors.whatsapp) message = errors.whatsapp[0];
        else if (errors.password) message = errors.password[0];
        else if (typeof errors === "string") message = errors;
      }
      throw new Error(message);
    } finally {
      if (isMounted.current) setActionLoading(false);
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
      if (isMounted.current) {
        setActionLoading(false);
        router.push("/auth/login");
      }
    }
  };

  const value = {
    user,
    loading,         // true only during initial load
    actionLoading,   // true during login/register/logout
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