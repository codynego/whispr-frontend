"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function AccountTab() {
  const [name, setName] = useState("Abednego Shina");
  const [email, setEmail] = useState("user@whispr.ai");

  return (
    <>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account information and security preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button>Save Changes</Button>
          <Button variant="outline">Change Password</Button>
        </div>
      </CardContent>
    </>
  );
}
