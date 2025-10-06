"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, RefreshCw } from "lucide-react";

export default function WhatsAppPage() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      recipient: "+234 812 345 6789",
      message: "Meeting with David confirmed for 2 PM.",
      status: "Delivered",
      time: "Today, 1:45 PM",
    },
    {
      id: 2,
      recipient: "+234 701 234 5678",
      message: "Don't forget to send the client proposal.",
      status: "Pending",
      time: "Yesterday, 9:12 AM",
    },
  ]);

  const refreshAlerts = () => {
    // later: fetch new alerts from backend
    console.log("Refreshing alerts...");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-green-600" />
          WhatsApp Alerts
        </h1>
        <Button
          variant="outline"
          onClick={refreshAlerts}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  {alert.recipient}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{alert.time}</p>
              </div>
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  alert.status === "Delivered"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {alert.status}
              </span>
            </CardHeader>
            <CardContent>
              <p>{alert.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
