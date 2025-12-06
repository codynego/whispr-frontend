// app/dashboard/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Check, Sparkles, Brain, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  plan: "free" | "pro" | "premium";
  status: "active" | "canceled" | "trial";
  current_period_end?: string;
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/subscription/`, {
      credentials: "include", // Sends HttpOnly cookies automatically
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => setSubscription(data || { plan: "free", status: "active" }))
      .catch(() => setSubscription({ plan: "free", status: "active" }))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const upgrade = async (plan: "pro" | "premium") => {
    if (!user) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/payments/initialize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) throw new Error("Checkout failed");

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to start checkout");
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Starter Memory",
      price: "Free",
      description: "Perfect for trying Whisone",
      features: [
        "30-day memory",
        "Basic notes & reminders",
        "Daily summary (text only)",
        "2 minutes voice-to-note per day",
        "1 email account",
        "50 actions/day",
      ],
      highlighted: false,
      current: subscription?.plan === "free",
    },
    {
      name: "Smart Memory",
      price: "$8",
      period: "/month",
      description: "Your everyday second brain",
      features: [
        "Unlimited notes & reminders",
        "Full WhatsApp automation",
        "60 min voice-to-note/month",
        "3 email accounts",
        "Smart insights & calendar sync",
        "180-day memory",
        "Priority speed",
        "Export data",
      ],
      highlighted: true,
      popular: true,
      current: subscription?.plan === "pro",
      action: () => upgrade("pro"),
    },
    {
      name: "Personal AI Brain",
      price: "$25",
      period: "/month",
      description: "Your full AI employee",
      features: [
        "Everything in Smart Memory",
        "Unlimited voice-to-note",
        "Unlimited email insights",
        "2-year memory",
        "Auto-organize & file attachments",
        "Custom AI workflows",
        "API access",
        "Fastest processing",
        "Rich multi-source briefings",
      ],
      highlighted: false,
      current: subscription?.plan === "premium",
      action: () => upgrade("premium"),
    },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your plan...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Please log in to view billing</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-2xl mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Choose Your Memory</h1>
          <p className="text-xl text-gray-600 mt-4">
            Unlock the full power of your second brain
          </p>
        </div>

        {/* Current Plan Badge */}
        {subscription && subscription.plan !== "free" && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 border-2 border-emerald-200 rounded-full">
              <Brain className="w-6 h-6 text-emerald-700" />
              <span className="font-semibold text-emerald-900">
                You’re on the {subscription.plan === "pro" ? "Smart" : "Personal AI Brain"} plan
              </span>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all ${
                plan.highlighted
                  ? "bg-emerald-600 text-white shadow-2xl scale-105"
                  : "bg-white border border-gray-200 shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <span className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className={`text-5xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-xl opacity-90">{plan.period}</span>}
                </div>
                <p className={`mt-3 ${plan.highlighted ? "text-emerald-50" : "text-gray-600"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-emerald-200" : "text-emerald-600"}`} />
                    <span className={plan.highlighted ? "text-emerald-50" : "text-gray-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.action}
                disabled={plan.current || loading}
                className={`w-full py-4 rounded-2xl font-semibold transition ${
                  plan.current
                    ? "bg-white/20 text-white/80 cursor-default"
                    : plan.highlighted
                    ? "bg-white text-emerald-600 hover:bg-emerald-50"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                } ${plan.current ? "" : "shadow-lg hover:shadow-xl"}`}
              >
                {plan.current ? (
                  <>Current Plan</>
                ) : plan.highlighted ? (
                  <>Upgrade to Pro <ArrowRight className="inline ml-2 w-5 h-5" /></>
                ) : (
                  <>Choose {plan.name.split(" ")[0]}</>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-4 text-sm text-gray-500">
            <Shield className="w-5 h-5" />
            <span>30-day money-back guarantee • Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}