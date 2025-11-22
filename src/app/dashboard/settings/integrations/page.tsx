// app/dashboard/settings/integrations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mail, Calendar, MessageCircle, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface ConnectedAccount {
  id: number;
  provider: "gmail" | "outlook";
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
        setAccounts(list.filter((a: any) => a.provider === "gmail")); // Only Gmail for now
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

  const disconnect = async (accountId: number) => {
    if (!confirm("Disconnect this Gmail account? Calendar will be deactivated.")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/${accountId}/deactivate/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    toast.success("Gmail disconnected");
  };

  const gmailConnected = accounts.length > 0;

  const integrations = [
    {
      name: "Gmail",
      description: "Email + Calendar sync",
      icon: Mail,
      color: "from-red-500 to-orange-600",
      active: true,
      connected: gmailConnected,
      email: gmailConnected ? accounts[0].email : null,
      onConnect: connectGmail,
      onDisconnect: () => disconnect(accounts[0].id),
    },
    {
      name: "Calendar",
      description: "Auto-activated with Gmail",
      icon: Calendar,
      color: "from-blue-500 to-indigo-600",
      active: gmailConnected,
      alwaysConnected: gmailConnected,
    },
    {
      name: "WhatsApp",
      description: "Your assistant lives here",
      icon: MessageCircle,
      color: "from-green-500 to-emerald-600",
      active: true,
      alwaysConnected: true,
    },
    {
      name: "Outlook",
      description: "Coming soon",
      icon: Mail,
      color: "from-blue-600 to-cyan-600",
      active: false,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-gray-600">Loading integrations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-3">Connect your world to your second brain</p>
        </div>

        <div className="space-y-6">
          {integrations.map((integration) => {
            const isConnected = integration.connected || integration.alwaysConnected;

            return (
              <div
                key={integration.name}
                className={`bg-white rounded-3xl shadow-lg border ${
                  integration.active ? "border-gray-100" : "border-gray-200 opacity-80"
                } p-8 transition hover:shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${integration.color} rounded-3xl flex items-center justify-center shadow-lg`}>
                      <integration.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        {integration.name}
                        {!integration.active && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            Coming Soon
                          </span>
                        )}
                        {integration.alwaysConnected && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Always On
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600 mt-1">{integration.description}</p>

                      {isConnected && integration.email && (
                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium text-emerald-700">{integration.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {integration.active && !isConnected && !integration.alwaysConnected && (
                    <button
                      onClick={integration.onConnect}
                      disabled={loading}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition shadow-lg"
                    >
                      {loading ? "Connecting..." : "Connect"}
                    </button>
                  )}

                  {isConnected && !integration.alwaysConnected && integration.onDisconnect && (
                    <button
                      onClick={integration.onDisconnect}
                      className="px-6 py-3 bg-red-100 text-red-700 rounded-2xl font-medium hover:bg-red-200 transition"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          More coming: Slack • Notion • Files • Voice
        </div>
      </div>
    </div>
  );
}