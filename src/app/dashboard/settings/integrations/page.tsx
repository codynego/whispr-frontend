// app/dashboard/settings/integrations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mail, MessageCircle, RefreshCw, Check, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";

interface ConnectedAccount {
  id: number;
  provider: "gmail" | "outlook" | "whatsapp";
  email: string;
  connected_at: string;
}

export default function IntegrationsPage() {
  const { accessToken } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : data.accounts || data.results || [];
        setAccounts(list);
      })
      .finally(() => setLoading(false));
  }, [accessToken]);

  const connectGmail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/gmail/init/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      toast.error("Failed to start Gmail connection");
    } finally {
      setLoading(false);
    }
  };

  const syncAccount = async (accountId: number) => {
    setSyncing(accountId);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/messages/sync/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ account_id: accountId }),
      });
      toast.success("Sync completed!");
    } catch {
      toast.error("Sync failed");
    } finally {
      setTimeout(() => setSyncing(null), 2000);
    }
  };

  const disconnect = async (accountId: number) => {
    if (!confirm("Disconnect this account?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/${accountId}/deactivate/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    toast.success("Account disconnected");
  };

  const integrations = [
    {
      name: "Gmail",
      description: "Read, summarize, and reply to your emails",
      icon: Mail,
      color: "from-red-500 to-orange-600",
      active: true,
      connected: accounts.find(a => a.provider === "gmail"),
      onConnect: connectGmail,
    },
    {
      name: "Outlook",
      description: "Coming soon — full Microsoft 365 integration",
      icon: Globe,
      color: "from-blue-600 to-cyan-600",
      active: false,
    },
    {
      name: "WhatsApp",
      description: "Your personal assistant lives here",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-600",
      active: false,
      note: "Always connected",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-2xl mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Integrations</h1>
          <p className="text-lg text-gray-600 mt-3">
            Connect your world — Whisone brings everything together
          </p>
        </div>

        <div className="space-y-8">
          {integrations.map((integration) => {
            const connectedAccount = integration.connected;
            const isSyncing = syncing === connectedAccount?.id;

            return (
              <div
                key={integration.name}
                className={`bg-white rounded-3xl shadow-xl border ${
                  integration.active ? "border-gray-100" : "border-gray-200 opacity-80"
                } p-10 transition-all hover:shadow-2xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${integration.color} rounded-3xl flex items-center justify-center shadow-lg`}>
                      <integration.icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {integration.name}
                        {!integration.active && (
                          <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                            Coming Soon
                          </span>
                        )}
                        {integration.note && (
                          <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                            {integration.note}
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 mt-2 max-w-md">{integration.description}</p>

                      {connectedAccount && (
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">{connectedAccount.email}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            Connected {new Date(connectedAccount.connected_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {integration.active && !connectedAccount && (
                      <button
                        onClick={integration.onConnect}
                        disabled={loading}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition shadow-lg hover:shadow-emerald-600/30 flex items-center gap-3"
                      >
                        {loading ? "Connecting..." : "Connect"}
                      </button>
                    )}

                    {connectedAccount && (
                      <>
                        <button
                          onClick={() => syncAccount(connectedAccount.id)}
                          disabled={isSyncing}
                          className={`px-6 py-3 rounded-2xl font-medium transition flex items-center gap-2 ${
                            isSyncing
                              ? "bg-gray-100 text-gray-600"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              Sync Now
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => disconnect(connectedAccount.id)}
                          className="px-6 py-3 bg-red-100 text-red-700 rounded-2xl font-medium hover:bg-red-200 transition"
                        >
                          Disconnect
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            More integrations coming soon — Calendar, Notion, Slack, and beyond
          </p>
        </div>
      </div>
    </div>
  );
}