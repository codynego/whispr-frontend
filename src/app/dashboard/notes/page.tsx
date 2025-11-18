"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { FileText, Calendar, Edit3, Trash2 } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(20);

  useEffect(() => {
    if (!accessToken) {
      setError("Please log in to view your notes.");
      setLoading(false);
      return;
    }
    fetchNotes(1);
  }, [accessToken]);

  const fetchNotes = async (page: number) => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);

      const url = `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/?page=${page}&page_size=${pageSize}`;

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      const apiNotes: Note[] = data.results || data;

      // Sort by most recently updated first
      const sorted = apiNotes.sort((a, b) => {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });

      setNotes(sorted);
      setTotalCount(data.count ?? apiNotes.length);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while loading notes");
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    setDeleting((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (response.ok || response.status === 204) {
        // Remove from UI immediately
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setTotalCount((prev) => prev - 1);
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete note. Please try again.");
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `Today at ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }

    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading your notes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchNotes(1)}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-2 text-gray-800 flex items-center gap-3">
        <FileText className="w-9 h-9 text-amber-600" />
        My Notes
      </h1>
      <p className="text-gray-500 mb-8">
        All your thoughts, ideas, meeting notes, and saved messages — in one place.
      </p>

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-20 h-20 mx-auto mb-6 text-gray-300" />
          <p className="text-xl text-gray-500">No notes yet.</p>
          <p className="text-gray-400 mt-2">Say “Hey Whisone, take a note...” to get started!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300 group"
              >
                <div className="min-h-[140px]">
                  <p className="text-gray-800 whitespace-pre-wrap break-words line-clamp-6">
                    {note.content || <span className="text-gray-400 italic">Empty note</span>}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(note.updated_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {/* TODO: Open edit modal */}}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Edit note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteNote(note.id)}
                      disabled={deleting[note.id]}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      aria-label="Delete note"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-4">
              <button
                onClick={() => fetchNotes(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCount} notes)
              </span>

              <button
                onClick={() => fetchNotes(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}