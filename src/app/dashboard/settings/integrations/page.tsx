"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function IntegrationsTab() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    const fetchAccounts = async () => {
      setFetchLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/accounts/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized: token invalid or expired");
          setFetchLoading(false);
          return;
        }

        const data = await res.json();
        // Handle both {accounts: [...]} and direct array response
        const accountsList = Array.isArray(data) ? data : (data.accounts || data.results || []);
        setAccounts(accountsList);
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchAccounts();
  }, [accessToken]);

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

  const handleDisconnect = async (accountId: number) => {
    if (!accessToken) {
      console.error("User not authenticated");
      return;
    }

    if (!confirm("Are you sure you want to disconnect this account?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/emails/deactivate/${accountId}/`,
        {
          method: "POST",
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

      if (res.ok) {
        setAccounts(accounts.filter((acc: any) => acc.id !== accountId));
      } else {
        console.error("Failed to disconnect account");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case "gmail": return "Gmail";
      case "outlook": return "Outlook";
      default: return provider;
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
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
        </div>
        {fetchLoading && <p className="text-muted-foreground text-center">Loading accounts...</p>}
        {accounts.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <div className="space-y-2">
              {accounts.map((account: any) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{getProviderDisplayName(account.provider)}: {account.email_address}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(account.id)}
                    disabled={loading}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        {accounts.length === 0 && !fetchLoading && (
          <div className="pt-4 border-t">
            <p className="text-muted-foreground text-center">No accounts connected yet.</p>
          </div>
        )}
      </CardContent>
    </>
  );
}