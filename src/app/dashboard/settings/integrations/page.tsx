"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function IntegrationsTab() {
  const { accessToken } = useAuth(); // get token from context
  const [loading, setLoading] = useState(false);

  const handleConnect = async (provider: "gmail" | "outlook") => {
    if (!accessToken) {
      console.error("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emails/oauth-url/${provider}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.status === 401) {
        console.error("Unauthorized: token invalid or expired");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // redirect to provider
      } else {
        console.error("Failed to get OAuth URL", data);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleConnect("gmail")}
          disabled={loading}
        >
          Connect Gmail
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => handleConnect("outlook")}
          disabled={loading}
        >
          Connect Outlook
        </Button>
        <Button variant="outline" className="w-full justify-start" disabled>
          Connect WhatsApp (Coming Soon)
        </Button>
      </CardContent>
    </>
  );
}
