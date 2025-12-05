"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, BookOpen, Loader2, Search, Calendar, Edit3, Trash2, Save, X, ChevronLeft } from 'lucide-react';

// Type definition based on Django Serializer
interface Note {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

// Mock Auth Context (replace with your actual context)
import { useAuth } from "@/context/AuthContext";

export default function NotePage() {
    const { accessToken } = useAuth();
    
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Notes
    const fetchNotes = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!res.ok) throw new Error("Failed to fetch notes.");
            
            const data: Note[] = await res.json();
            console.log("Fetched notes:", data);
            setNotes(data);
        } catch (error) {
            console.error("Could not load notes:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);
    
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Handle New Note
    const handleNewNote = () => {
        const newNote = { 
            id: -1,
            title: "Untitled Note", 
            content: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        setSelectedNote(newNote);
        setEditedTitle(newNote.title);
        setEditedContent(newNote.content);
        setIsEditing(true);
    };

    // Handle Select Note
    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
        setEditedTitle(note.title);
        setEditedContent(note.content);
        setIsEditing(false);
    };

    // Handle Save
    const handleSave = async () => {
        if (!selectedNote || !accessToken) return;
        
        setIsSaving(true);
        try {
            const isNew = selectedNote.id === -1;
            const url = isNew 
                ? `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/`
                : `${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${selectedNote.id}/`;
            
            const method = isNew ? 'POST' : 'PUT';
            
            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: editedTitle,
                    content: editedContent,
                }),
            });
            
            if (!res.ok) throw new Error("Failed to save note.");
            
            const savedNote: Note = await res.json();
            setSelectedNote(savedNote);
            setIsEditing(false);
            fetchNotes();
        } catch (error) {
            console.error("Could not save note:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle Delete
    const handleDelete = async () => {
        if (!selectedNote || selectedNote.id === -1 || !accessToken) return;
        
        if (!confirm('Are you sure you want to delete this note?')) return;
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${selectedNote.id}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!res.ok) throw new Error("Failed to delete note.");
            
            setSelectedNote(null);
            fetchNotes();
        } catch (error) {
            console.error("Could not delete note:", error);
        }
    };

    // Filter notes by search
    const filteredNotes = Array.isArray(notes) 
        ? notes.filter(note => 
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const showList = !isMobile || selectedNote === null;
    const showEditor = !isMobile || selectedNote !== null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg">
                                <BookOpen className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
                                <p className="text-sm text-gray-600">{notes.length} total notes</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleNewNote}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg hover:shadow-xl font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">New Note</span>
                        </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Notes Grid/List */}
                    {showList && (
                        <div className={`${showEditor ? 'lg:col-span-1' : 'lg:col-span-3'} space-y-4`}>
                            {filteredNotes.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500">No notes found. Create your first note!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {filteredNotes.map((note) => (
                                        <div
                                            key={note.id}
                                            onClick={() => handleSelectNote(note)}
                                            className={`bg-white rounded-2xl p-5 cursor-pointer transition hover:shadow-lg border-2 ${
                                                selectedNote?.id === note.id 
                                                    ? 'border-emerald-500 shadow-md' 
                                                    : 'border-transparent shadow-sm'
                                            }`}
                                        >
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                                                {note.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {note.content || 'No content'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(note.updated_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Editor Area */}
                    {showEditor && selectedNote && (
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 md:p-8">
                            {/* Mobile Back Button */}
                            {isMobile && (
                                <button
                                    onClick={() => setSelectedNote(null)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>
                            )}

                            {/* Editor Header */}
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Edit3 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {isEditing ? 'Editing' : 'Viewing'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Updated {formatDate(selectedNote.updated_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditedTitle(selectedNote.title);
                                                    setEditedContent(selectedNote.content);
                                                    setIsEditing(false);
                                                }}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            {selectedNote.id !== -1 && (
                                                <button
                                                    onClick={handleDelete}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Editor Content */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        placeholder="Note title..."
                                        className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-400"
                                    />
                                    <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        placeholder="Start writing..."
                                        className="w-full min-h-96 text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder-gray-400"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {selectedNote.title}
                                    </h2>
                                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                                        {selectedNote.content || (
                                            <p className="text-gray-400 italic">No content yet. Click edit to add content.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}