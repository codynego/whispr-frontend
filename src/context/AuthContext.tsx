"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any;
  accessToken: string | null;
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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedAccess = localStorage.getItem("access_token");
    const storedRefresh = localStorage.getItem("refresh_token");
    if (storedAccess) {
      setAccessToken(storedAccess);
      fetchUser(storedAccess);
    } else if (storedRefresh) {
      refreshToken(storedRefresh);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (refresh: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/token/refresh/`, {
        refresh,
      });
      const newAccess = res.data.access;
      localStorage.setItem("access_token", newAccess);
      setAccessToken(newAccess);
      fetchUser(newAccess);
    } catch {
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/login/`, { email, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    setAccessToken(res.data.access);
    fetchUser(res.data.access);
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
    // First, create the user via the registration endpoint
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/register/`, data);
    
    // Then, automatically log in the new user
    await login(data.email, data.password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    setAccessToken(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};