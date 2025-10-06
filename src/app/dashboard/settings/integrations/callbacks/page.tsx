"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";


export default function OAuthCallback() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting your account...");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");
    const state = query.get("state"); // "provider=gmail"
    const provider = state?.split("=")[1]; // "gmail"

    if (!code || !provider) {
      setStatus("error");
      setMessage("Missing authorization code or provider.");
      return;
    }

    async function connectAccount() {
      try {
        const res = await fetch(
        `${BACKEND_BASE_URL}/emails/oauth-callback/?code=${encodeURIComponent(code!)}&provider=${encodeURIComponent(provider!)}`,
        {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            },
        }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to connect account");
        }

        setStatus("success");
        setMessage(`${provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Account'} account connected successfully!`);

        // Redirect to settings/integrations after a short delay
        setTimeout(() => router.push("/dashboard/settings/integrations"), 2000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Something went wrong while connecting your account.");
      }
    }

    connectAccount();
  }, [router, accessToken]);

  return (
    <div className="flex items-center justify-center h-screen">
      {status === "loading" && <p className="text-gray-500">{message}</p>}
      {status === "success" && <p className="text-green-500">{message}</p>}
      {status === "error" && <p className="text-red-500">{message}</p>}
    </div>
  );
}



