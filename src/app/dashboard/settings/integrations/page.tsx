// app/dashboard/settings/integrations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mail, MessageCircle, Sparkles, X } from "lucide-react";
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
    if (!confirm(`Disconnect ${email}?`)) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/integrations/${accountId}/deactivate/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    setAccounts(prev => prev.filter(a => a.id !== accountId));
    toast.success("Disconnected");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="text-center pt-8 pb-8">
        <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
      </div>

      {/* Gmail + Calendar */}
      <div className="pb-20">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100">
          {/* Top: Title + Connect */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Gmail + Calendar</h3>
                  <p className="text-sm text-gray-600">Email & calendar sync</p>
                </div>
              </div>

              <button
                onClick={connectGmail}
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition shadow-md"
              >
                {loading ? "Connecting..." : "+ Connect"}
              </button>
            </div>
          </div>

          {/* Connected Accounts */}
          {accounts.length > 0 ? (
            <div className="p-5 space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-600 rounded-2xl flex items-center justify-center">
                      <Mail className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{acc.email}</span>
                  </div>

                  <button
                    onClick={() => disconnect(acc.id, acc.email)}
                    className="w-8 h-8 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10 text-sm">No Gmail accounts connected</p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="mt-5 bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                WhatsApp
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Always On
                </span>
              </h3>
              <p className="text-sm text-gray-600">Your assistant lives here</p>
            </div>
          </div>
        </div>

        {/* Outlook - Coming Soon */}
        <div className="mt-5 bg-white/70 rounded-3xl p-6 border border-gray-200 opacity-75">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                Outlook
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </h3>
              <p className="text-sm text-gray-600">Microsoft 365 integration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center text-xs text-gray-500 pb-8">
        More coming soon
      </div>
    </div>
  );
}