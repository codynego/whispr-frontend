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

interface UserEmailRule {
  id: number;
  name: string;
  rule_type: string;
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

interface ImportanceChoice {
  value: string;
  label: string;
}

interface FormData {
  name: string;
  rule_type: string;
  value: string;
  importance: string;
  is_active: boolean;
}

const RULE_TYPES = [
  { value: "sender", label: "Sender Email" },
  { value: "keyword", label: "Keyword in Subject/Body" },
  { value: "subject", label: "Subject Contains" },
  { value: "body", label: "Body Contains" },
  { value: "attachment", label: "Has Attachment" },
  { value: "reply", label: "Is a Reply/Forward" },
  { value: "ai", label: "AI Context Rule" },
];

const IMPORTANCE_CHOICES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function RulesTab() {
  const { accessToken } = useAuth();
  const [rules, setRules] = useState<UserEmailRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<UserEmailRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rule_type: "",
    value: "",
    importance: "medium",
    is_active: true,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    fetchRules();
  }, [accessToken]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/user-rules/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status === 401) {
        console.error("Unauthorized");
        return;
      }
      const data = await res.json();
      const rulesList = Array.isArray(data) ? data : (data.results || []);
      setRules(rulesList);
    } catch (err) {
      console.error("Failed to fetch rules", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!accessToken) return;
    setSubmitLoading(true);
    const url = editingRule
      ? `${process.env.NEXT_PUBLIC_API_URL}/emails/user-rules/${editingRule.id}/`
      : `${process.env.NEXT_PUBLIC_API_URL}/emails/user-rules/`;
    const method = editingRule ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchRules();
        resetForm();
      } else {
        console.error("Failed to save rule");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    if (!accessToken) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/user-rules/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        fetchRules();
      } else {
        console.error("Failed to delete rule");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleActive = async (rule: UserEmailRule) => {
    if (!accessToken) return;
    setSubmitLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emails/user-rules/${rule.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ...rule, is_active: !rule.is_active }),
      });
      if (res.ok) {
        fetchRules();
      } else {
        console.error("Failed to toggle active");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rule_type: "",
      value: "",
      importance: "medium",
      is_active: true,
    });
    setEditingRule(null);
    setFormOpen(false);
  };

  const openForm = (rule?: UserEmailRule) => {
    if (rule) {
      setFormData({
        name: rule.name,
        rule_type: rule.rule_type,
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

  if (loading) {
    return <div className="p-8 text-center">Loading rules...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Rules</CardTitle>
          <CardDescription>Manage custom rules for email processing and importance scoring.</CardDescription>
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
                  {editingRule ? "Update your email rule settings." : "Create a new email rule to customize email processing."}
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
                  <Label htmlFor="rule_type">Rule Type</Label>
                  <Select name="rule_type" value={formData.rule_type} onValueChange={(value: string) => setFormData({ ...formData, rule_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rule type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_TYPES.map((type: RuleType) => (
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
                  <Select name="importance" value={formData.importance} onValueChange={(value) => setFormData({ ...formData, importance: value })}>
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