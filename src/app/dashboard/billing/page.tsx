"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Subscription {
  id: number;
  plan: string;
  status: string;
  start_date: string;
  end_date: string;
  next_payment_date: string;
  amount: number;
  currency: string;
  created_at: string;
}

interface Payment {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  description: string;
  created_at: string;
  paid_at: string | null;
}

export default function BillingTab() {
  const { accessToken } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "enterprise">("basic");

  const plans = [
    { id: "basic" as const, name: "Basic", price: 9.99, features: ["10 emails/day", "Basic AI", "Support"] },
    { id: "premium" as const, name: "Premium", price: 19.99, features: ["Unlimited emails", "Advanced AI", "Priority Support"] },
    { id: "enterprise" as const, name: "Enterprise", price: 49.99, features: ["Unlimited everything", "Custom AI", "Dedicated Support"] },
  ];

  useEffect(() => {
    if (!accessToken) {
      setError("Please log in to view billing information.");
      setLoading(false);
      return;
    }
    fetchBillingData();
  }, [accessToken]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subscription
      const subRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/subscription/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!subRes.ok) throw new Error("Failed to fetch subscription");
      const subData = await subRes.json();
      setSubscription(subData);

      // Fetch payments
      const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/payments/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!payRes.ok) throw new Error("Failed to fetch payments");
      const payData = await payRes.json();
      setPayments(payData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleInitializePayment = async () => {
    if (!accessToken) return;

    setInitializing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/billing/payments/initialize/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to initialize payment");
      }

      const data = await res.json();
      // Assuming the response includes a payment URL (e.g., for Paystack)
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        toast.success("Payment initialized. Check your email for details.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize payment";
      setError(message);
      toast.error(message);
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
        <div className="text-lg text-gray-600">Loading billing information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
        <div className="text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchBillingData}
          className="ml-4 text-blue-600 underline hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentPlan = plans.find((p) => p.id === (subscription?.plan || "basic")) || plans[0];

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Current Subscription
        </h2>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">{currentPlan.name} Plan</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {subscription.status.toUpperCase()}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p><span className="font-medium">Amount:</span> {subscription.currency} {subscription.amount}</p>
                <p><span className="font-medium">Next Payment:</span> {new Date(subscription.next_payment_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p><span className="font-medium">Start Date:</span> {new Date(subscription.start_date).toLocaleDateString()}</p>
                {subscription.end_date && <p><span className="font-medium">End Date:</span> {new Date(subscription.end_date).toLocaleDateString()}</p>}
              </div>
            </div>
            {subscription.status !== "active" && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-4">Your subscription is inactive. Upgrade to continue enjoying premium features.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No active subscription. Start with Basic plan today!
          </div>
        )}
      </div>

      {/* Upgrade/Plans - Always show */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {subscription?.status === "active" ? "Manage Your Plan" : "Choose Your Plan"}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = subscription?.status === "active" && subscription.plan === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-lg p-6 border-2 transition-all ${
                  selectedPlan === plan.id
                    ? "border-blue-600 bg-blue-50"
                    : isCurrent
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-600 mb-4">${plan.price}<span className="text-sm font-normal text-gray-600">/mo</span></p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id)}
                    disabled={isCurrent}
                    className="rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">
                    {isCurrent ? "Current Plan" : `Select ${plan.name}`}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center mt-6">
          <button
            onClick={handleInitializePayment}
            disabled={initializing || (subscription?.status === "active" && subscription.plan === selectedPlan)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initializing ? "Processing..." : subscription?.status === "active" ? "Switch Plan" : "Upgrade Now"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        {subscription?.status === "active" && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Switching plans will take effect at the end of your current billing cycle.
          </p>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Recent Payments
        </h2>
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Reference</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Plan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 5).map((payment) => (
                  <tr key={payment.id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-mono text-blue-600">{payment.reference}</td>
                    <td className="px-4 py-3">{payment.plan}</td>
                    <td className="px-4 py-3">{payment.currency} {payment.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === "success" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length > 5 && (
              <p className="text-sm text-gray-500 mt-2">Showing 5 of {payments.length} payments</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}