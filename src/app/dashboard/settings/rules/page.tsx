"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface UserRule {
  id: number;
  user?: string;
  name: string;
  rule_type: string;
  channel: string;
  value: string | null;
  importance: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RuleType {
  value: string;
  label: string;
}

interface ChannelChoice {
  value: string;
  label: string;
}

interface ImportanceChoice {
  value: string;
  label: string;
}

interface FormData {
  name: string;
  rule_type: string;
  channel: string;
  value: string;
  importance: string;
  is_active: boolean;
}

const RULE_TYPES: RuleType[] = [
  { value: "sender", label: "Sender" },
  { value: "keyword", label: "Keyword in Subject/Body" },
  { value: "subject", label: "Subject Contains" },
  { value: "body", label: "Body Contains" },
  { value: "attachment", label: "Has Attachment" },
  { value: "reply", label: "Is a Reply/Forward" },
  { value: "ai", label: "AI Context Rule" },
];

const CHANNEL_CHOICES: ChannelChoice[] = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

const IMPORTANCE_CHOICES: ImportanceChoice[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function RulesTab() {
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [rules, setRules] = useState<UserRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<UserRule | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    rule_type: "",
    channel: "email",
    value: "",
    importance: "medium",
    is_active: true,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchRules();
  }, [user, authLoading]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/rules/`, {
        credentials: "include", // Sends HttpOnly cookies
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.warn("Unauthorized — user may be logged out");
          return;
        }
        throw new Error("Failed to fetch rules");
      }

      const data = await res.json();
      const rulesList = Array.isArray(data) ? data : (data.results || []);
      setRules(rulesList);
    } catch (err) {
      console.error("Failed to fetch rules", err);
      toast.error("Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (key: keyof FormData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitLoading(true);

    const url = editingRule
      ? `${process.env.NEXT_PUBLIC_API_URL}/unified/rules/${editingRule.id}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/unified/rules/`;
    const method = editingRule ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingRule ? "Rule updated" : "Rule created");
        fetchRules();
        resetForm();
      } else {
        toast.error("Failed to save rule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save rule");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    if (!user) return;

    setSubmitLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/rules/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Rule deleted");
        fetchRules();
      } else {
        toast.error("Failed to delete rule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete rule");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActive = async (rule: UserRule) => {
    if (!user) return;
    setSubmitLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/unified/rules/${rule.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...rule, is_active: !rule.is_active }),
      });

      if (res.ok) {
        toast.success("Rule updated");
        fetchRules();
      } else {
        toast.error("Failed to update rule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update rule");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rule_type: "",
      channel: "email",
      value: "",
      importance: "medium",
      is_active: true,
    });
    setEditingRule(null);
    setFormOpen(false);
  };

  const openForm = (rule?: UserRule) => {
    if (rule) {
      setFormData({
        name: rule.name,
        rule_type: rule.rule_type,
        channel: rule.channel,
        value: rule.value || "",
        importance: rule.importance,
        is_active: rule.is_active,
      });
      setEditingRule(rule);
    } else {
      resetForm();
    }
    setFormOpen(true);
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center">Loading rules...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Please log in to manage rules</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Message Rules</CardTitle>
          <CardDescription>Manage custom rules for message processing and importance scoring across channels.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()}>Create New Rule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRule ? "Edit Rule" : "Create New Rule"}</DialogTitle>
                <DialogDescription>
                  {editingRule ? "Update your message rule settings." : "Create a new message rule to customize processing."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Rule name"
                  />
                </div>
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select value={formData.channel} onValueChange={(value) => handleSelectChange("channel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNEL_CHOICES.map((ch) => (
                        <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rule_type">Rule Type</Label>
                  <Select value={formData.rule_type} onValueChange={(value) => handleSelectChange("rule_type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(formData.rule_type === "sender" || formData.rule_type === "keyword" || formData.rule_type === "subject" || formData.rule_type === "body") && (
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      placeholder="e.g., example@email.com or keyword"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="importance">Importance</Label>
                  <Select value={formData.importance} onValueChange={(value) => handleSelectChange("importance", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select importance" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMPORTANCE_CHOICES.map((imp) => (
                        <SelectItem key={imp.value} value={imp.value}>{imp.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitLoading}>
                  {submitLoading ? "Saving..." : editingRule ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No rules created yet. Create one above!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        {CHANNEL_CHOICES.find((ch) => ch.value === rule.channel)?.label || rule.channel}
                      </span>
                    </TableCell>
                    <TableCell>{RULE_TYPES.find((t) => t.value === rule.rule_type)?.label}</TableCell>
                    <TableCell className="max-w-xs truncate">{rule.value || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.importance === "high" ? "bg-red-100 text-red-800" :
                        rule.importance === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {rule.importance.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleActive(rule)}
                        disabled={submitLoading}
                      />
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openForm(rule)}
                        disabled={submitLoading}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(rule.id)}
                        disabled={submitLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}