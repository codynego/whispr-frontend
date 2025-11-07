"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  Zap, Settings, Play, Pause, Edit3, Trash2, Plus, 
  Clock, Mail, MessageCircle, Calendar, AlertCircle, X, Loader2
} from "lucide-react";

interface Automation {
  id: number;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_condition?: any;
  action_type: string;
  action_params?: any;
  is_active: boolean;
  last_triggered_at?: string;
  next_run_at?: string;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
}

const TRIGGER_TYPES = [
  { value: "on_email_received", label: "On Email Received" },
  { value: "on_schedule", label: "On Schedule" },
  { value: "on_message_received", label: "On Message Received" },
  { value: "on_task_due", label: "On Task Due" },
  { value: "on_calendar_event", label: "On Calendar Event" },
  { value: "manual", label: "Manual Trigger" },
] as const;

const ACTION_TYPES = [
  { value: "summarize_email", label: "Summarize Email" },
  { value: "reply_email", label: "Reply to Email" },
  { value: "send_email", label: "Send Email" },
  { value: "analyze_email", label: "Analyze Email Content" },
  { value: "classify_email", label: "Classify Email Topic" },
  { value: "reminder", label: "Set Reminder" },
  { value: "follow_up", label: "Send Follow-up" },
  { value: "meeting_note", label: "Meeting Summary or Note" },
  { value: "translate_message", label: "Translate Message" },
  { value: "daily_digest", label: "Daily Email Digest" },
  { value: "weekly_report", label: "Weekly Summary Report" },
  { value: "alert", label: "Important Email Alert" },
  { value: "task_summary", label: "Summarize Tasks or Progress" },
  { value: "auto_reply", label: "Automatic Email Reply" },
  { value: "auto_summarize", label: "Auto Summarize New Messages" },
  { value: "auto_followup", label: "Auto Follow-Up" },
  { value: "smart_notify", label: "Smart Notification for Key Emails" },
  { value: "auto_categorize", label: "Automatically Categorize Emails" },
  { value: "priority_rank", label: "Rank Emails by Priority" },
  { value: "sentiment_analysis", label: "Analyze Email Sentiment" },
  { value: "custom", label: "Custom Task" },
] as const;

const getTriggerIcon = (type: string) => {
  switch (type) {
    case 'on_email_received': return Mail;
    case 'on_message_received': return MessageCircle;
    case 'on_schedule': return Clock;
    case 'on_task_due': return AlertCircle;
    case 'on_calendar_event': return Calendar;
    case 'manual': return Zap;
    default: return Zap;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return dateString;
  }
};

export default function AutomationsPage() {
  const { accessToken } = useAuth();
  const router = useRouter();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'on_email_received',
    trigger_condition: '{}',
    action_type: 'summarize_email',
    action_params: '{}',
    recurrence_pattern: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch automations
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    fetchAutomations();
  }, [accessToken]);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/automations/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to fetch automations');
      const data = await res.json();
      setAutomations(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/assistant/automations/${editingId}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/assistant/utomations/`;
      
      const body = {
        ...formData,
        trigger_condition: JSON.parse(formData.trigger_condition),
        action_params: JSON.parse(formData.action_params),
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(editingId ? 'Failed to update' : 'Failed to create');
      setCreating(false);
      setEditingId(null);
      setFormData({ name: '', description: '', trigger_type: 'on_email_received', trigger_condition: '{}', action_type: 'summarize_email', action_params: '{}', recurrence_pattern: '' });
      fetchAutomations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving automation');
    }
  };

  const handleEdit = (automation: Automation) => {
    setFormData({
      name: automation.name,
      description: automation.description || '',
      trigger_type: automation.trigger_type,
      trigger_condition: JSON.stringify(automation.trigger_condition || {}),
      action_type: automation.action_type,
      action_params: JSON.stringify(automation.action_params || {}),
      recurrence_pattern: automation.recurrence_pattern || '',
    });
    setEditingId(automation.id);
    setCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this automation?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/automations/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      fetchAutomations();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/automations/${id}/toggle/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      fetchAutomations();
    } catch (err) {
      setError('Failed to toggle');
    }
  };

  const handleTrigger = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/automations/${id}/trigger/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to trigger');
      alert('Automation triggered successfully');
    } catch (err) {
      setError('Failed to trigger');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
              <p className="text-gray-600">Set up smart workflows for your inbox</p>
            </div>
          </div>
          <button
            onClick={() => { setCreating(true); setEditingId(null); setFormData({ name: '', description: '', trigger_type: 'on_email_received', trigger_condition: '{}', action_type: 'summarize_email', action_params: '{}', recurrence_pattern: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Automation
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 hover:text-red-900">
              <X className="w-4 h-4 inline" />
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(creating || editingId) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Automation' : 'Create Automation'}
                </h2>
                <button onClick={() => { setCreating(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
                  <select
                    value={formData.trigger_type}
                    onChange={(e) => setFormData({ ...formData, trigger_type: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TRIGGER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Condition (JSON)</label>
                  <textarea
                    value={formData.trigger_condition}
                    onChange={(e) => setFormData({ ...formData, trigger_condition: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={3}
                    placeholder='{"from": "example@email.com", "contains": ["urgent"]}'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select
                    value={formData.action_type}
                    onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ACTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Params (JSON)</label>
                  <textarea
                    value={formData.action_params}
                    onChange={(e) => setFormData({ ...formData, action_params: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={3}
                    placeholder='{"priority": "high", "tone": "friendly"}'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Pattern</label>
                  <input
                    type="text"
                    value={formData.recurrence_pattern}
                    onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="daily, weekly, etc."
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setCreating(false); setEditingId(null); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className="grid gap-4">
          {automations.map((automation) => {
            const TriggerIcon = getTriggerIcon(automation.trigger_type);
            return (
              <div key={automation.id} className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center`}>
                        <TriggerIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{automation.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          automation.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {automation.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {automation.description && (
                        <p className="text-sm text-gray-600 mb-2">{automation.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Trigger: {automation.trigger_type.replace(/_/g, ' ').toLowerCase()}</span>
                        <span>•</span>
                        <span>Action: {automation.action_type.replace(/_/g, ' ').toLowerCase()}</span>
                        {automation.next_run_at && (
                          <>
                            <span>•</span>
                            <span>Next: {formatDate(automation.next_run_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleTrigger(automation.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Manual Trigger"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(automation.id, automation.is_active)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title={automation.is_active ? 'Pause' : 'Activate'}
                    >
                      {automation.is_active ? <Pause className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEdit(automation)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(automation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {automation.last_triggered_at && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    Last triggered: {formatDate(automation.last_triggered_at)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {automations.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Automations Yet</h3>
            <p className="text-gray-600 mb-4">Create your first automation to get started</p>
            <button
              onClick={() => { setCreating(true); setEditingId(null); setFormData({ name: '', description: '', trigger_type: 'on_email_received', trigger_condition: '{}', action_type: 'summarize_email', action_params: '{}', recurrence_pattern: '' }); }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Automation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}