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
  const { user, loading: authLoading } = useAuth();

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
          credentials: "include",
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
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading assistant config...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <p className="text-gray-600 text-sm sm:text-base">Please log in to customize your assistant</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-xl sm:text-2xl">Assistant Personality</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Customize how WhisprAI communicates and prioritizes your messages.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6">
        {/* Enable Assistant Toggle */}
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5 bg-emerald-50/50 rounded-xl border border-emerald-200">
          <div className="min-w-0 flex-1">
            <Label className="font-medium text-sm sm:text-base text-gray-900">Enable Assistant</Label>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Turn your AI assistant on or off</p>
          </div>
          <Switch
            checked={config.is_enabled}
            onCheckedChange={(checked) => updateConfig("is_enabled", checked)}
            disabled={saving}
            className="flex-shrink-0 data-[state=checked]:bg-emerald-600"
          />
        </div>

        {/* Max Response Length */}
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="max_response_length" className="text-sm sm:text-base font-medium text-gray-900">
            Max Response Length
          </Label>
          <Input
            id="max_response_length"
            type="number"
            value={config.max_response_length}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateConfig("max_response_length", parseInt(e.target.value) || 0)
            }
            disabled={saving}
            className="text-sm sm:text-base focus:ring-emerald-500 focus:border-emerald-600"
          />
          <p className="text-xs sm:text-sm text-gray-500">Maximum number of characters in responses</p>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature" className="text-sm sm:text-base font-medium text-gray-900">
              Temperature
            </Label>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {config.temperature.toFixed(1)}
            </span>
          </div>
          <Slider
            id="temperature"
            value={[config.temperature]}
            onValueChange={(value) => updateConfig("temperature", value[0])}
            min={0}
            max={1}
            step={0.1}
            disabled={saving}
            className="w-full [&_[role=slider]]:bg-emerald-600 [&_[role=slider]]:border-emerald-600 [&>.relative>.absolute]:bg-emerald-600"
          />
          <p className="text-xs sm:text-sm text-gray-500">Controls randomness: 0 is focused, 1 is creative</p>
        </div>

        {/* Top P Slider */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="top_p" className="text-sm sm:text-base font-medium text-gray-900">
              Top P
            </Label>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {config.top_p.toFixed(1)}
            </span>
          </div>
          <Slider
            id="top_p"
            value={[config.top_p]}
            onValueChange={(value) => updateConfig("top_p", value[0])}
            min={0}
            max={1}
            step={0.1}
            disabled={saving}
            className="w-full [&_[role=slider]]:bg-emerald-600 [&_[role=slider]]:border-emerald-600 [&>.relative>.absolute]:bg-emerald-600"
          />
          <p className="text-xs sm:text-sm text-gray-500">Controls diversity of word choices</p>
        </div>

        {/* Tone Selection */}
        <div className="space-y-3 sm:space-y-4">
          <Label className="text-sm sm:text-base font-medium text-gray-900 block">Select Tone</Label>
          <RadioGroup
            value={config.tone}
            onValueChange={(value) => updateConfig("tone", value)}
            disabled={saving}
            className="space-y-3"
          >
            <div className={`flex items-start space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${
              config.tone === 'business' 
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-gray-50 border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-300'
            }`}>
              <RadioGroupItem 
                value="business" 
                id="business" 
                className="mt-0.5 flex-shrink-0 border-emerald-600 text-emerald-600" 
              />
              <div className="min-w-0 flex-1">
                <Label htmlFor="business" className="font-medium text-sm sm:text-base text-gray-900 cursor-pointer">
                  Business
                </Label>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Formal & focused communication</p>
              </div>
            </div>
            <div className={`flex items-start space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${
              config.tone === 'friendly' 
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-gray-50 border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-300'
            }`}>
              <RadioGroupItem 
                value="friendly" 
                id="friendly" 
                className="mt-0.5 flex-shrink-0 border-emerald-600 text-emerald-600" 
              />
              <div className="min-w-0 flex-1">
                <Label htmlFor="friendly" className="font-medium text-sm sm:text-base text-gray-900 cursor-pointer">
                  Friendly
                </Label>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Warm & conversational style</p>
              </div>
            </div>
            <div className={`flex items-start space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${
              config.tone === 'personal' 
                ? 'bg-emerald-50 border-emerald-500' 
                : 'bg-gray-50 border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-300'
            }`}>
              <RadioGroupItem 
                value="personal" 
                id="personal" 
                className="mt-0.5 flex-shrink-0 border-emerald-600 text-emerald-600" 
              />
              <div className="min-w-0 flex-1">
                <Label htmlFor="personal" className="font-medium text-sm sm:text-base text-gray-900 cursor-pointer">
                  Personal
                </Label>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Casual & relaxed tone</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="instructions" className="text-sm sm:text-base font-medium text-gray-900 block">
            Custom Instructions
          </Label>
          <Textarea
            id="instructions"
            placeholder="e.g., Always prioritize client emails first, summarize all newsletters weekly..."
            value={config.custom_instructions ?? ""}
            onChange={(e) => updateConfig("custom_instructions", e.target.value)}
            disabled={saving}
            className="min-h-[120px] text-sm sm:text-base resize-none focus:ring-emerald-500 focus:border-emerald-600"
            rows={5}
          />
          <p className="text-xs sm:text-sm text-gray-500">Add specific guidelines for your assistant</p>
        </div>

        {/* Save Button */}
        <div className="pt-2 sm:pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-600/30 transition-all"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </div>
  );
}