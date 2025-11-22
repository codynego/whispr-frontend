// app/dashboard/settings/integrations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mail, Calendar, MessageCircle, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ConnectedAccount {
  id: number;
  provider: "gmail";
  email: string;
  connected_at: string;
}

export default function IntegrationsPage() {
  const { accessToken } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : data.accounts || data.results || [];
        setAccounts(list.filter((a: any) => a.provider === "gmail"));
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
      toast.error("Failed to connect Gmail");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async (accountId: number, email: string) => {
    if (!confirm(`Disconnect ${email}? Calendar access will be removed.`)) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/${accountId}/deactivate/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setAccounts(prev => prev.filter(a => a.id !== accountId));
    toast.success(`${email} disconnected`);
  };

  const integrations = [
    {
      name: "Gmail + Calendar",
      description: "Email and calendar sync — one click",
      icon: Mail,
      color: "from-red-500 to-orange-600",
      active: true,
      accounts: accounts,
      onConnect: connectGmail,
    },
    {
      name: "WhatsApp",
      description: "Your assistant lives here — always connected",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-600",
      active: true,
      alwaysConnected: true,
    },
    {
      name: "Outlook",
      description: "Microsoft 365 integration — coming soon",
      icon: Mail,
      color: "from-blue-600 to-cyan-600",
      active: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center px-6">
        <p className="text-gray-600">Loading integrations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header — Full width */}
      <div className="text-center pt-8 pb-10 px-6">
        <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <Sparkles className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-2">Connect your world</p>
      </div>

      {/* Cards — Full width on mobile */}
      <div className="space-y-5 px-6 pb-20">
        {integrations.map((integration) => {
          const hasAccounts = integration.accounts && integration.accounts.length > 0;
          const isConnected = hasAccounts || integration.alwaysConnected;

          return (
            <div
              key={integration.name}
              className={`bg-white rounded-3xl shadow-lg border ${
                integration.active ? "border-gray-100" : "border-gray-200 opacity-75"
              } p-6 transition hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 bg-gradient-to-br ${integration.color} rounded-3xl flex items-center justify-center shadow-lg`}>
                    <integration.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {integration.name}
                      {!integration.active && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Soon
                        </span>
                      )}
                      {integration.alwaysConnected && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Always On
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>

                {integration.active && !isConnected && !integration.alwaysConnected && (
                  <button
                    onClick={integration.onConnect}
                    disabled={loading}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    {loading ? "Connecting..." : "Connect"}
                  </button>
                )}
              </div>

              {/* Connected Gmail Accounts */}
              {hasAccounts && (
                <div className="space-y-3 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Calendar access enabled:
                  </div>

                  {integration.accounts!.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-600 rounded-2xl flex items-center justify-center">
                          <Mail className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{acc.email}</p>
                          <p className="text-xs text-gray-500">
                            Connected {new Date(acc.connected_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => disconnect(acc.id, acc.email)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-xs font-medium hover:bg-red-200 transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Disconnect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Minimal Footer */}
      <div className="text-center text-xs text-gray-500 pb-6">
        More coming: Slack • Notion • Files
      </div>
    </div>
  );
}