// // lib/fetcher.ts
// import { getCookie } from "cookies-next"

// export const fetcher = async (url: string, options: RequestInit = {}) => {
//   const token = getCookie("access_token") // or however you store it

//   const res = await fetch(url, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: token ? `Bearer ${token}` : "",
//       ...options.headers,
//     },
//   })

//   if (!res.ok) {
//     const error = new Error("An error occurred") as any
//     error.status = res.status
//     try {
//       error.info = await res.json()
//     } catch {
//       error.info = { detail: "Something went wrong" }
//     }
//     throw error
//   }

//   return res.json()
// }


// lib/fetcher.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically add Bearer token to EVERY request
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh token + redirect on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        // No refresh token → force logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// SWR fetcher that uses our smart axios instance
export const fetcher = (url: string) => api.get(url).then((res) => res.data);