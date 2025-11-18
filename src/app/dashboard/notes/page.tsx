"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Calendar, Edit3, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const { accessToken } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!accessToken) {
      setError("Please log in to view your notes.");
      setLoading(false);
      return;
    }
    fetchNotes(1);
  }, [accessToken]);

  // Auto-focus + adjust height + scroll into view
  useEffect(() => {
    if (isModalOpen && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
      setTimeout(() => textarea.scrollTop = textarea.scrollHeight, 100);
    }
  }, [isModalOpen, noteContent]);

  const fetchNotes = async (page: number) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/?page=${page}&page_size=${pageSize}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch notes");

      const data = await response.json();
      const apiNotes: Note[] = data.results || data;

      const sorted = apiNotes.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setNotes(sorted);
      setTotalCount(data.count ?? apiNotes.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setNoteContent("");
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setIsModalOpen(true);
  };

  const saveNote = async () => {
    if (!noteContent.trim() || !accessToken) return;

    setSaving(true);
    try {
      const url = editingNote
        ? `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${editingNote.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`;

      const method = editingNote ? "PATCH" : "POST";
      const body = JSON.stringify({ content: noteContent.trim() });

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });

      if (!response.ok) throw new Error("Failed to save note");

      const savedNote: Note = await response.json();

      if (editingNote) {
        // Update existing
        setNotes(prev => prev.map(n => n.id === savedNote.id ? savedNote : n));
      } else {
        // Add new at top
        setNotes(prev => [savedNote, ...prev]);
        setTotalCount(c => c + 1);
      }

      setIsModalOpen(false);
      setNoteContent("");
      setEditingNote(null);
    } catch (err) {
      alert("Could not save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm("Delete this note permanently?")) return;

    setDeleting(prev => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok || response.status === 204) {
        setNotes(prev => prev.filter(n => n.id !== id));
        setTotalCount(c => c - 1);
      }
    } catch (err) {
      alert("Could not delete note");
    } finally {
      setDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) return <div className="p-6 text-center text-gray-600">Loading notes...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error} <button onClick={() => fetchNotes(1)} className="underline">Retry</button></div>;

  return (
    <>
      <div className="p-6 bg-gray-50 min-h-screen relative">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center gap-3">
            <FileText className="w-9 h-9 text-blue-600" />
            My Notes
          </h1>
          <p className="text-gray-500 mb-8">
            All your thoughts, ideas, meeting notes, and saved messages — in one place.
          </p>

          {notes.length === 0 ? (
            <div className="text-center py-20">
            <FileText className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <p className="text-xl text-gray-500">No notes yet</p>
            <p className="text-gray-400 mt-2">
                Say{' '}
                <span className="font-medium text-blue-600">
                &quot;Hey Whisone, take a note about the meeting&quot;
                </span>{' '}
                to get started
            </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    onClick={() => openEditModal(note)}
                  >
                    <div className="min-h-[160px]">
                      <p className="text-gray-800 whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {note.content || <span className="text-gray-400 italic">Empty note</span>}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(note.updated_at)}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(note);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          disabled={deleting[note.id]}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          {deleting[note.id] ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-6">
                  <button onClick={() => fetchNotes(currentPage - 1)} disabled={currentPage === 1}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition">
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {currentPage} of {totalPages} ({totalCount} notes)</span>
                  <button onClick={() => fetchNotes(currentPage + 1)} disabled={currentPage === totalPages}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Create Button */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-blue-700 transition-all duration-300 z-10"
          aria-label="New note"
        >
          <Plus className="w-9 h-9" />
        </button>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-7 h-7 text-blue-600" />
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <textarea
                ref={textareaRef}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Start typing your note..."
                className="w-full h-full min-h-[300px] resize-none outline-none text-lg text-gray-800 placeholder-gray-400"
                disabled={saving}
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingNote(null);
                  setNoteContent("");
                }}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                disabled={!noteContent.trim() || saving}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium flex items-center gap-2"
              >
                {saving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}