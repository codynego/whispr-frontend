"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import axios, { AxiosInstance, AxiosError } from "axios";
import { useRouter } from "next/navigation";

// --- Types ---
interface UserRegistrationData {
  email: string;
  password: string;
  password_confirm: string;
  whatsapp: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: any;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserRegistrationData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AuthContext = createContext<AuthContextType | null>(null);

// --- Single Axios instance with credentials ---
const authApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // This sends the HTTP-only refresh_token cookie
});

// --- Refresh queue ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

// --- Auth Provider ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await authApi.post("/users/logout/");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setUser(null);
      setAccessToken(null);
      router.push("/auth/login");
    }
  }, [router]);

  // Fetch user profile
  const fetchUser = useCallback(
    async (token: string) => {
      try {
        const res = await authApi.get("/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        handleLogout();
      } finally {
        setLoading(false);
      }
    },
    [handleLogout]
  );

  // Refresh access token — THIS LINE IS CRITICAL: send {} body
  const refreshToken = useCallback(async (): Promise<string> => {
    try {
      const res = await authApi.post("/users/token/refresh/", {}); // ← {} fixes the 400!
      const newToken = res.data.access;
      setAccessToken(newToken);
      return newToken;
    } catch (err) {
      handleLogout();
      throw err;
    }
  }, [handleLogout]);

  // --- Interceptors ---
  useEffect(() => {
    const reqIntercept = authApi.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    const resIntercept = authApi.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        const origReq = error.config as any;

        if (error.response?.status === 401 && origReq && !origReq._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                origReq.headers.Authorization = `Bearer ${token}`;
                return authApi(origReq);
              })
              .catch((err) => Promise.reject(err));
          }

          origReq._retry = true;
          isRefreshing = true;

          try {
            const newToken = await refreshToken();
            processQueue(null, newToken);
            origReq.headers.Authorization = `Bearer ${newToken}`;
            return authApi(origReq);
          } catch (refreshErr) {
            processQueue(refreshErr as AxiosError, null);
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      authApi.interceptors.request.eject(reqIntercept);
      authApi.interceptors.response.eject(resIntercept);
    };
  }, [accessToken, refreshToken]);

  // --- On mount: restore session ---
  useEffect(() => {
    refreshToken()
      .then((token) => fetchUser(token))
      .catch(() => setLoading(false));
  }, [refreshToken, fetchUser]);

  // --- Login ---
  const login = async (email: string, password: string) => {
    const res = await authApi.post("/users/login/", { email, password });
    setAccessToken(res.data.access);
    await fetchUser(res.data.access);
    router.push("/dashboard");
  };

  // --- Register ---
  const register = async (data: UserRegistrationData) => {
    await authApi.post("/users/register/", data);
    await login(data.email, data.password);
  };

  const logout = handleLogout;

  const value = useMemo(
    () => ({ user, accessToken, login, register, logout, loading }),
    [user, accessToken, loading, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};