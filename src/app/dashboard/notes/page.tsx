// src/app/dashboard/notes/page.tsx or components/Notes/NotePage.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, NotebookText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// --- Import Developed Components ---
import { NoteList } from '@/components/notes/NoteList';
import { NoteEditor } from '@/components/notes/NoteEditor';
// -----------------------------------

// Type definition based on your Django Serializer output
interface Note {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export default function NotePage() {
    const { accessToken } = useAuth();
    
    // --- State Management ---
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    // --- API Interactions ---
    
    // 1. Fetch All Notes
    const fetchNotes = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            // Your Django URL: /api/notes/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!res.ok) throw new Error("Failed to fetch notes.");
            
            const data: Note[] = await res.json();
            console.log("Fetched Notes:", data);
            setNotes(data);

        } catch (error: any) {
            toast.error(error.message || "Could not load notes.");
        } finally {
            setLoading(false);
        }
    }, [accessToken]);
    
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);


    // 2. Handlers for Child Components

    const handleNewNote = () => {
        // Clear selection to prepare a new note draft
        setSelectedNote({ 
            id: -1, // Temporary ID for a new note
            title: "New Note", 
            content: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
    };

    const handleSaveSuccess = (updatedNote: Note, isNew: boolean) => {
        toast.success(isNew ? "Note created!" : "Note saved!");
        fetchNotes(); // Re-fetch the list to update titles/order
        
        // Update the selected note with the server's response (especially the real ID for new notes)
        setSelectedNote(updatedNote); 
    };

    const handleDeleteSuccess = () => {
        toast.success("Note deleted successfully.");
        setSelectedNote(null);
        fetchNotes(); // Re-fetch the list
    };

    // --- UI Logic ---
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const showList = !isMobile || selectedNote === null;
    const showEditor = !isMobile || selectedNote !== null;


    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 h-full overflow-hidden bg-gray-50 md:p-6 p-0">
            
            {/* --- Notes List Sidebar (Hidden on mobile when editor is open) --- */}
            {showList && (
                <div 
                    className={`bg-white border-r border-gray-200 shadow-md ${showEditor ? 'md:w-1/3' : 'w-full'} min-w-80 h-full flex flex-col transition-all duration-300`}
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <NotebookText className="w-5 h-5 text-indigo-600" />
                            My Notes
                        </h1>
                        <button 
                            onClick={handleNewNote}
                            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus className="w-4 h-4" />
                            New
                        </button>
                    </div>

                    <NoteList
                        notes={notes}
                        selectedNoteId={selectedNote?.id || null}
                        onSelectNote={handleSelectNote}
                    />
                </div>
            )}

            {/* --- Note Editor Area (Takes full width on mobile when open) --- */}
            {showEditor && (
                <div className={`flex-1 ${!showList ? 'w-full' : 'hidden md:block'} h-full bg-white md:rounded-xl shadow-lg overflow-y-auto transition-all duration-300`}>
                    {selectedNote ? (
                        <NoteEditor 
                            note={selectedNote} 
                            onSaveSuccess={handleSaveSuccess} 
                            onDeleteSuccess={handleDeleteSuccess}
                            onBack={() => setSelectedNote(null)} // Mobile back action
                            accessToken={accessToken!}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 flex-col p-8">
                            <NotebookText className="w-12 h-12 mb-4" />
                            <p className="text-lg">Select a note or click &apos;New&apos; to begin.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}