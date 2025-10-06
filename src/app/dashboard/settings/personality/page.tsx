"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PersonalityTab() {
  const [tone, setTone] = useState("business");
  const [customInstruction, setCustomInstruction] = useState("");

  return (
    <>
      <CardHeader>
        <CardTitle>Assistant Personality</CardTitle>
        <CardDescription>
          Customize how WhisprAI communicates and prioritizes your messages.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <Label className="mb-2 block">Select Tone</Label>
          <RadioGroup value={tone} onValueChange={setTone}>
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
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
          />
        </div>

        <Button>Save Preferences</Button>
      </CardContent>
    </>
  );
}
