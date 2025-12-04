"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import { useRouter } from "next/navigation";

// --- Types & Constants ---

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

// --- API Instance & Interceptor (No localStorage Access) ---

const authApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Crucial for sending cookies on cross-origin requests
  withCredentials: true, 
});

let isRefreshing = false;
let failedQueue: { resolve: (value: any) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Auth Provider ---

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Helper function to handle full session removal and redirect
  const handleLogout = useCallback(async () => {
    try {
        // Call backend to clear the HTTP-only refresh token cookie
        await authApi.post(`/users/logout/`); 
    } catch (e) {
        console.error("Logout cleanup failed:", e);
    }
    setUser(null);
    setAccessToken(null);
    router.push("/auth/login");
  }, [router]);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const res = await authApi.get(`/users/profile/`, {
        // Use token passed directly, not relying on interceptor yet
        headers: { Authorization: `Bearer ${token}` }, 
      });
      setUser(res.data);
      return true;
    } catch (error) {
      // Failed to fetch user with token, meaning token is bad/expired
      handleLogout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  // Refresh Token Function: Does NOT need the token as an argument anymore.
  // The browser automatically sends the HTTP-only cookie.
  const refreshToken = useCallback(async () => {
    try {
      // Request sent with HTTP-only cookie automatically
      const res = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {}, { withCredentials: true }); 
      
      const newAccess = res.data.access;
      setAccessToken(newAccess); // Access token only in memory
      
      // We don't fetch user here; we let the original failed request retry
      return newAccess;
    } catch (error) {
      // If refresh fails (cookie expired/missing), session is dead.
      handleLogout();
      throw error; 
    }
  }, [handleLogout]);


  // --- Axios Interceptor Setup ---
  useEffect(() => {
    // 1. Request Interceptor: Attach the access token from in-memory state
    const requestInterceptor = authApi.interceptors.request.use(config => {
      // Use the current in-memory token state
      if (accessToken) { 
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    // 2. Response Interceptor: Handle 401 Unauthorized errors
    const responseInterceptor = authApi.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          
          if (isRefreshing) {
            // Queue the failed request
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return authApi(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          (originalRequest as any)._retry = true;
          isRefreshing = true;
          
          try {
            // Refresh token is sent via HTTP-only cookie
            const newAccessToken = await refreshToken(); 
            
            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return authApi(originalRequest);
          } catch (e) {
            processQueue(error, null);
            // handleLogout already called inside refreshToken on failure
            return Promise.reject(e);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      authApi.interceptors.request.eject(requestInterceptor);
      authApi.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, refreshToken]); // accessToken is now a dependency for the request interceptor

  // --- Initial Load Effect ---
  useEffect(() => {
    const initializeAuth = async () => {
        // On load, we MUST try to get a new Access Token using the persistent HTTP-only cookie.
        try {
            const initialAccess = await refreshToken(); // This refreshes and sets the in-memory state
            await fetchUser(initialAccess); // Fetch user data immediately
        } catch (e) {
            // Refresh failed (no cookie, or expired cookie). Session is unauthenticated.
            setLoading(false);
            // handleLogout is called inside refreshToken
        }
    }

    initializeAuth();
  }, [fetchUser, refreshToken]);

  // --- Auth Functions ---

  const login = async (email: string, password: string) => {
    // Backend sets the HTTP-only Refresh Token cookie here
    const res = await axios.post(`${API_BASE_URL}/users/login/`, { email, password }, { withCredentials: true });
    
    setAccessToken(res.data.access); // Access Token in memory
    await fetchUser(res.data.access);
    router.push("/dashboard");
  };

  const register = async (data: UserRegistrationData) => {
    await axios.post(`${API_BASE_URL}/users/register/`, data);
    await login(data.email, data.password);
  };
  
  const contextValue = useMemo(() => ({
    user,
    accessToken,
    login,
    register,
    logout: handleLogout,
    loading,
  }), [user, accessToken, loading, handleLogout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};