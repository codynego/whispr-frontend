"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Check } from "lucide-react";

export default function IntegrationsTab() {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<{ [key: number]: 'idle' | 'syncing' | 'synced' }>({});

  useEffect(() => {
    if (!accessToken) return;

    const fetchAccounts = async () => {
      setFetchLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/`, {
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
        `${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/gmail/init/`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/${accountId}/deactivate/`,
        {
          method: "PATCH",
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

  const handleSync = async (accountId: number) => {
    if (!accessToken) return;

    setSyncStatus((prev) => ({ ...prev, [accountId]: 'syncing' }));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/messages/sync/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ account_id: accountId }),
      });

      if (res.ok) {
        setSyncStatus((prev) => ({ ...prev, [accountId]: 'synced' }));
        // Reset to idle after 3 seconds
        setTimeout(() => {
          setSyncStatus((prev) => ({ ...prev, [accountId]: 'idle' }));
        }, 3000);
      } else {
        console.error("Failed to sync account");
        setSyncStatus((prev) => ({ ...prev, [accountId]: 'idle' }));
      }
    } catch (err) {
      console.error("Sync error", err);
      setSyncStatus((prev) => ({ ...prev, [accountId]: 'idle' }));
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case "gmail": return "Gmail";
      case "outlook": return "Outlook";
      default: return provider;
    }
  };

  const getSyncButtonVariant = (status: 'idle' | 'syncing' | 'synced') => {
    switch (status) {
      case 'syncing': return 'destructive';
      case 'synced': return 'default';
      default: return 'outline';
    }
  };

  const getSyncButtonContent = (status: 'idle' | 'syncing' | 'synced') => {
    switch (status) {
      case 'syncing':
        return <><RefreshCw className="w-4 h-4 animate-spin mr-1" />Syncing...</>;
      case 'synced':
        return <><Check className="w-4 h-4 mr-1" />Synced</>;
      default:
        return <><RefreshCw className="w-4 h-4 mr-1" />Sync</>;
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
              {accounts.map((account: any) => {
                const status = syncStatus[account.id] || 'idle';
                return (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{getProviderDisplayName(account.provider)}: {account.address_or_id}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={getSyncButtonVariant(status)}
                        size="sm"
                        onClick={() => handleSync(account.id)}
                        disabled={status === 'syncing' || loading}
                        className={status === 'synced' ? 'text-green-600 border-green-600' : ''}
                      >
                        {getSyncButtonContent(status)}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        disabled={loading || status === 'syncing'}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                );
              })}
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