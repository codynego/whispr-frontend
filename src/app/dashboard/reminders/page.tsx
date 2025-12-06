"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Bell, Loader2, Trash2, Edit2, Check, X,
  Clock, Calendar, CheckCircle
} from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

interface Reminder {
  id: number;
  text: string;
  remind_at: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  title?: string;
}

export default function ReminderPage() {
  const { user, loading: authLoading } = useAuth(); // No accessToken!

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newRemindAt, setNewRemindAt] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedRemindAt, setEditedRemindAt] = useState('');

  // FETCH REMINDERS
  const fetchReminders = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, {
        credentials: "include", // Sends HttpOnly cookies automatically
      });

      if (!res.ok) throw new Error("Failed to fetch reminders.");

      const data = await res.json();
      setReminders(data.results ?? []);
    } catch (error) {
      console.error("Could not load reminders:", error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // ADD
  const handleAddReminder = async () => {
    if (!newText.trim() || !newRemindAt || !user) return;

    setIsAdding(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          text: newText,
          remind_at: newRemindAt,
          completed: false,
        }),
      });

      if (!res.ok) throw new Error("Failed to create reminder");

      setNewText('');
      setNewRemindAt('');
      setShowAddForm(false);
      fetchReminders();
    } catch (error) {
      console.error("Could not create reminder:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // TOGGLE COMPLETE
  const handleToggleComplete = async (reminder: Reminder) => {
    if (!user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${reminder.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          text: reminder.text,
          remind_at: reminder.remind_at,
          completed: !reminder.completed,
        }),
      });

      if (!res.ok) throw new Error("Failed to update reminder");

      fetchReminders();
    } catch (error) {
      console.error("Could not update reminder:", error);
    }
  };

  // UPDATE
  const handleUpdateReminder = async (id: number) => {
    if (!editedText.trim() || !editedRemindAt || !user) return;

    try {
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify({
          text: editedText,
          remind_at: editedRemindAt,
          completed: reminder.completed,
        }),
      });

      if (!res.ok) throw new Error("Failed to update reminder");

      setEditingId(null);
      setEditedText('');
      setEditedRemindAt('');
      fetchReminders();
    } catch (error) {
      console.error("Could not update reminder:", error);
    }
  };

  // DELETE
  const handleDeleteReminder = async (id: number) => {
    if (!user) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/reminders/${id}/`, {
        method: 'DELETE',
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete reminder");

      fetchReminders();
    } catch (error) {
      console.error("Could not delete reminder:", error);
    }
  };

  // Helpers
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isPast = date < now;

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isPast,
    };
  };

  const sortedReminders = [...reminders].sort((a, b) =>
    new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()
  );

  const upcomingCount = reminders.filter(r => !r.completed && new Date(r.remind_at) > new Date()).length;
  const completedCount = reminders.filter(r => r.completed).length;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
        <p className="text-xl text-gray-600">Please log in to view reminders</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Reminders</h1>
              <p className="text-gray-600">
                {upcomingCount} upcoming · {completedCount} completed
              </p>
            </div>
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              New Reminder
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-emerald-500">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Reminder</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="e.g., Call the dentist"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="datetime-local"
                value={newRemindAt}
                onChange={(e) => setNewRemindAt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddReminder}
                  disabled={isAdding || !newText.trim() || !newRemindAt}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 font-medium"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewText('');
                    setNewRemindAt('');
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {sortedReminders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No reminders yet. Create one to get started!</p>
            </div>
          ) : (
            sortedReminders.map((reminder) => {
              const { date, time, isPast } = formatDateTime(reminder.remind_at);
              const isEditing = editingId === reminder.id;

              return (
                <div
                  key={reminder.id}
                  className={`bg-white rounded-xl shadow-sm p-5 transition hover:shadow-md
                    ${reminder.completed ? 'opacity-60' : ''}
                    ${isPast && !reminder.completed ? 'border-l-4 border-amber-400' : ''}`}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full px-4 py-3 border border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <input
                        type="datetime-local"
                        value={editedRemindAt}
                        onChange={(e) => setEditedRemindAt(e.target.value)}
                        className="w-full px-4 py-3 border border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleUpdateReminder(reminder.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                        >
                          <Check className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditedText('');
                            setEditedRemindAt('');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleToggleComplete(reminder)} className="flex-shrink-0 mt-1">
                        {reminder.completed ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-emerald-500 transition" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium mb-2 ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {reminder.text}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> {date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {time}
                          </div>
                          {isPast && !reminder.completed && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(reminder.id);
                            setEditedText(reminder.text);
                            setEditedRemindAt(reminder.remind_at.slice(0, 16));
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}