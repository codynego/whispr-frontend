"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AssistantConfig {
  id: number;
  is_enabled: boolean;
  max_response_length: number;
  temperature: number;
  top_p: number;
  tone: string;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export default function PersonalityTab() {
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [config, setConfig] = useState<AssistantConfig>({
    id: 0,
    is_enabled: true,
    max_response_length: 1000,
    temperature: 0.7,
    top_p: 1,
    tone: "business",
    custom_instructions: "",
    created_at: "",
    updated_at: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/config/`, {
          credentials: "include", // Sends HttpOnly cookies automatically
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.warn("Unauthorized — user may be logged out");
            return;
          }
          throw new Error("Failed to fetch config");
        }

        const data = await res.json();
        setConfig({
          ...data,
          custom_instructions: data.custom_instructions ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch config", err);
        toast.error("Failed to load assistant config");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/config/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          is_enabled: config.is_enabled,
          max_response_length: config.max_response_length,
          temperature: config.temperature,
          top_p: config.top_p,
          tone: config.tone,
          custom_instructions: config.custom_instructions,
        }),
      });

      if (res.ok) {
        toast.success("Assistant preferences saved");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch (err) {
      console.error("Save error", err);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof AssistantConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Loading assistant config...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Please log in to customize your assistant</p>
      </div>
    );
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Assistant Personality</CardTitle>
        <CardDescription>
          Customize how WhisprAI communicates and prioritizes your messages.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Enable Assistant</Label>
          <Switch
            checked={config.is_enabled}
            onCheckedChange={(checked) => updateConfig("is_enabled", checked)}
            disabled={saving}
          />
        </div>

        <div>
          <Label htmlFor="max_response_length">Max Response Length</Label>
          <Input
            id="max_response_length"
            type="number"
            value={config.max_response_length}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateConfig("max_response_length", parseInt(e.target.value) || 0)
            }
            disabled={saving}
          />
        </div>

        <div>
          <Label htmlFor="temperature">Temperature ({config.temperature})</Label>
          <Slider
            id="temperature"
            value={[config.temperature]}
            onValueChange={(value) => updateConfig("temperature", value[0])}
            min={0}
            max={1}
            step={0.1}
            disabled={saving}
          />
        </div>

        <div>
          <Label htmlFor="top_p">Top P ({config.top_p})</Label>
          <Slider
            id="top_p"
            value={[config.top_p]}
            onValueChange={(value) => updateConfig("top_p", value[0])}
            min={0}
            max={1}
            step={0.1}
            disabled={saving}
          />
        </div>

        <div>
          <Label className="mb-2 block">Select Tone</Label>
          <RadioGroup
            value={config.tone}
            onValueChange={(value) => updateConfig("tone", value)}
            disabled={saving}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="business" id="business" />
              <Label htmlFor="business">Business (formal & focused)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="friendly" id="friendly" />
              <Label htmlFor="friendly">Friendly (warm & conversational)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="personal" id="personal" />
              <Label htmlFor="personal">Personal (casual & relaxed)</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="instructions" className="mb-2 block">
            Add Custom Instructions
          </Label>
          <Textarea
            id="instructions"
            placeholder="e.g., Always prioritize client emails first, summarize all newsletters weekly..."
            value={config.custom_instructions ?? ""}
            onChange={(e) => updateConfig("custom_instructions", e.target.value)}
            disabled={saving}
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </>
  );
}