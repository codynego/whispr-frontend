"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Calendar, Edit3, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12; // Looks better with modern cards
  const totalPages = Math.ceil(totalCount / pageSize);

  useEffect(() => {
    if (accessToken) fetchNotes(1);
    else {
      setError("Please log in to view your notes.");
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isModalOpen && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [isModalOpen]);

  const fetchNotes = async (page: number) => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/?page=${page}&page_size=${pageSize}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }
      if (!res.ok) throw new Error("Failed to load notes");

      const data = await res.json();
      const sorted = (data.results || data).sort(
        (a: Note, b: Note) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      setNotes(sorted);
      setTotalCount(data.count ?? sorted.length);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Failed to load notes");
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
    if (!noteContent.trim()) return;
    setSaving(true);

    try {
      const url = editingNote
        ? `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${editingNote.id}/`
        : `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`;

      const res = await fetch(url, {
        method: editingNote ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ content: noteContent.trim() }),
      });

      if (!res.ok) throw new Error();

      const savedNote: Note = await res.json();

      if (editingNote) {
        setNotes((prev) => prev.map((n) => (n.id === savedNote.id ? savedNote : n)));
      } else {
        setNotes((prev) => [savedNote, ...prev]);
        setTotalCount((c) => c + 1);
      }

      setIsModalOpen(false);
    } catch {
      alert("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm("Delete this note permanently?")) return;

    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (res.ok || res.status === 204) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setTotalCount((c) => c - 1);
      }
    } catch {
      alert("Failed to delete note");
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    }
    return format(date, "MMM d, yyyy");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 text-lg">{error}</p>
        <button onClick={() => fetchNotes(1)} className="mt-4 text-blue-600 underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pb-24">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                My Notes
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                {totalCount} {totalCount === 1 ? "note" : "notes"} • Last updated {notes[0] ? formatDate(notes[0].updated_at) : "never"}
              </p>
            </div>
          </div>

          {/* Empty State */}
          {notes.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-32 h-32 mx-auto mb-8 bg-blue-100 rounded-3xl flex items-center justify-center">
                <FileText className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">No notes yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Say{" "}
                <span className="font-semibold text-blue-600">
                  “Hey Whisone, take a note about the meeting”
                </span>{" "}
                to create your first one
              </p>
            </div>
          ) : (
            <>
              {/* Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => openEditModal(note)}
                    className="group relative bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl hover:shadow-blue-600/20 border border-gray-100 cursor-pointer transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative">
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap line-clamp-6">
                        {note.content || <span className="text-gray-400 italic">Empty note</span>}
                      </p>

                      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(note.updated_at)}</span>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(note);
                            }}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            disabled={deleting[note.id]}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
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
                  </div>
                ))}
              </div>

              {/* Modern Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-16">
                  <button
                    onClick={() => fetchNotes(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchNotes(page)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => fetchNotes(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating Action Button */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 hover:bg-blue-700 active:scale-95 transition-all z-50 ring-8 ring-blue-600/20"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-10 h-10 text-blue-600" />
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
            </div>

            <textarea
              ref={textareaRef}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 p-8 text-lg text-gray-800 placeholder-gray-400 resize-none outline-none"
              disabled={saving}
            />

            <div className="p-8 border-t border-gray-100 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={saveNote}
                disabled={!noteContent.trim() || saving}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
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