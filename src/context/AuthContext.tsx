// context/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  actionLoading: boolean;
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
] as const;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const mountedRef = useRef(true);
  const initRef = useRef(false); // Prevents double init in StrictMode

  // Stable check — no function recreation
  const isPublicPage = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));

  // Fetch user profile
  const fetchUser = async () => {
    if (isPublicPage) {
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

  // Initial load — runs only once per mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (!mountedRef.current) return;

    fetchUser();

    return () => {
      mountedRef.current = false;
    };
  }, [pathname]); // Only re-run if route changes (e.g. login → dashboard)

  // Axios 401 interceptor — stable dependency
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isPublicPage
        ) {
          originalRequest._retry = true;
          try {
            await api.post("/users/token/refresh/");
            return api(originalRequest);
          } catch (refreshErr) {
            setUser(null);
            router.push("/auth/login");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [pathname, router]); // Stable deps only

  // Login
  const login = async (email: string, password: string) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await api.post("/users/login/", { email, password });
      await fetchUser();
      router.push("/dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        "Invalid email or password.";
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Register
  const register = async (data: any) => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await api.post("/users/register/", data);
      await login(data.email, data.password);
    } catch (err: any) {
      const errors = err.response?.data;
      let msg = "Registration failed.";

      if (errors) {
        msg = errors.email?.[0] || errors.whatsapp?.[0] || errors.password?.[0] || errors.detail || msg;
      }

      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      await api.post("/users/logout/", {});
    } catch (err) {
      console.warn("Logout failed, continuing...");
    } finally {
      setUser(null);
      setActionLoading(false);
      router.push("/auth/login");
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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};