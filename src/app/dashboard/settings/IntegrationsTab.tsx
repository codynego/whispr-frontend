"use client";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function IntegrationsTab() {
  return (
    <>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          Connect Gmail
        </Button>
        <Button variant="outline" className="w-full justify-start">
          Connect Outlook
        </Button>
        <Button variant="outline" className="w-full justify-start">
          Connect WhatsApp
        </Button>
      </CardContent>
    </>
  );
}
