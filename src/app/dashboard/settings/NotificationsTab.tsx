"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function NotificationsTab() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);

  return (
    <>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how WhisprAI should keep you updated.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Email Alerts</Label>
          <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
        </div>

        <div className="flex items-center justify-between">
          <Label>WhatsApp Alerts</Label>
          <Switch checked={whatsappAlerts} onCheckedChange={setWhatsappAlerts} />
        </div>

        <div className="flex items-center justify-between">
          <Label>Daily Summary (morning brief)</Label>
          <Switch checked={dailySummary} onCheckedChange={setDailySummary} />
        </div>
      </CardContent>
    </>
  );
}
