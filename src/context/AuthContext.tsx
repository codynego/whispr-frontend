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
    router.push("/auth/login");
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





// "use client";

// import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
// import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
// import { useRouter } from "next/navigation";

// // --- Types ---
// interface UserRegistrationData {
//   email: string;
//   password: string;
//   password_confirm: string;
//   whatsapp: string;
//   first_name: string;
//   last_name: string;
// }

// interface AuthContextType {
//   user: any;
//   accessToken: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (data: UserRegistrationData) => Promise<void>;
//   logout: () => void;
//   loading: boolean;
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// const AuthContext = createContext<AuthContextType | null>(null);

// // --- Single Axios Instance with withCredentials: true (CRITICAL) ---
// const authApi: AxiosInstance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { "Content-Type": "application/json" },
//   withCredentials: true, // This ensures cookies are sent on EVERY request
// });

// // --- Token Refresh Queue Logic ---
// let isRefreshing = false;
// let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

// const processQueue = (error: AxiosError | null, token: string | null = null) => {
//   failedQueue.forEach((prom) => {
//     error ? prom.reject(error) : prom.resolve(token!);
//   });
//   failedQueue = [];
// };

// // --- Auth Provider ---
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [accessToken, setAccessToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   // Logout helper
//   const handleLogout = useCallback(async () => {
//     try {
//       await authApi.post("/users/logout/");
//     } catch (e) {
//       console.error("Logout failed:", e);
//     } finally {
//       setUser(null);
//       setAccessToken(null);
//       router.push("/auth/login");
//     }
//   }, [router]);

//   // Fetch current user
//   const fetchUser = useCallback(
//     async (token: string) => {
//       try {
//         const res = await authApi.get("/users/profile/", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setUser(res.data);
//       } catch (err) {
//         handleLogout();
//       } finally {
//         setLoading(false);
//       }
//     },
//     [handleLogout]
//   );

//   // Refresh access token using HTTP-only refresh cookie
//   const refreshToken = useCallback(async (): Promise<string> => {
//     try {
//       const res = await authApi.post("/users/token/refresh/");
//       const newToken = res.data.access;
//       setAccessToken(newToken);
//       return newToken;
//     } catch (err) {
//       handleLogout();
//       throw err;
//     }
//   }, [handleLogout]);

//   // --- Axios Interceptors (only set up once) ---
//   useEffect(() => {
//     // Request: attach current access token
//     const reqInterceptor = authApi.interceptors.request.use((config) => {
//       if (accessToken) {
//         config.headers.Authorization = `Bearer ${accessToken}`;
//       }
//       return config;
//     });

//     // Response: handle 401 → refresh token
//     const resInterceptor = authApi.interceptors.response.use(
//       (response) => response,
//       async (error: AxiosError) => {
//         const originalRequest = error.config as any;

//         if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
//           if (isRefreshing) {
//             return new Promise((resolve, reject) => {
//               failedQueue.push({ resolve, reject });
//             })
//               .then((token) => {
//                 originalRequest.headers.Authorization = `Bearer ${token}`;
//                 return authApi(originalRequest);
//               })
//               .catch((err) => Promise.reject(err));
//           }

//           originalRequest._retry = true;
//           isRefreshing = true;

//           try {
//             const newToken = await refreshToken();
//             processQueue(null, newToken);
//             originalRequest.headers.Authorization = `Bearer ${newToken}`;
//             return authApi(originalRequest);
//           } catch (refreshError) {
//             processQueue(refreshError as AxiosError, null);
//             return Promise.reject(refreshError);
//           } finally {
//             isRefreshing = false;
//           }
//         }

//         return Promise.reject(error);
//       }
//     );

//     return () => {
//       authApi.interceptors.request.eject(reqInterceptor);
//       authApi.interceptors.response.eject(resInterceptor);
//     };
//   }, [accessToken, refreshToken]);

//   // --- On mount: try to restore session via refresh token ---
//   useEffect(() => {
//     refreshToken()
//       .then((token) => fetchUser(token))
//       .catch(() => setLoading(false));
//   }, [refreshToken, fetchUser]);

//   // --- Public methods ---
//   const login = async (email: string, password: string) => {
//     const res = await authApi.post("/users/login/", { email, password });
//     setAccessToken(res.data.access);
//     await fetchUser(res.data.access);
//     router.push("/dashboard");
//   };

//   const register = async (data: UserRegistrationData) => {
//     await authApi.post("/users/register/", data);
//     await login(data.email, data.password);
//   };

//   const logout = handleLogout;

//   const contextValue = useMemo(
//     () => ({ user, accessToken, login, register, logout, loading }),
//     [user, accessToken, loading]
//   );

//   return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
// };

// // --- Hook ---
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error("useAuth must be used within AuthProvider");
//   return context;
// };