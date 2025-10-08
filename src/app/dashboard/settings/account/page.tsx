"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface UserProfile {
  id: number;
  email: string;
  whatsapp: string | null;
  first_name: string;
  last_name: string;
  plan: string;
  is_active: boolean;
  date_joined: string;
}

export default function AccountTab() {
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState<UserProfile>({
    id: 0,
    email: "",
    whatsapp: "",
    first_name: "",
    last_name: "",
    plan: "",
    is_active: false,
    date_joined: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized");
          return;
        }

        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!accessToken) return;

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          whatsapp: formData.whatsapp,
        }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      console.error("Update error", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    // Implement password change logic, e.g., open a modal or redirect
    toast.info("Password change feature coming soon");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account information and security preferences.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp Number (with country code)</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            placeholder="+1234567890"
            value={formData.whatsapp || ""}
            onChange={handleInputChange}
          />
          <p className="text-xs text-muted-foreground">
            Include the country code (e.g., +1 for US, +44 for UK) for proper verification.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={handleChangePassword} disabled={saving}>
            Change Password
          </Button>
        </div>

        {formData.plan && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">Current Plan: {formData.plan}</p>
          </div>
        )}
      </CardContent>
    </>
  );
}