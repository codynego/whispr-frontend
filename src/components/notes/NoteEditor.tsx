// src/components/Notes/NoteEditor.tsx

import { useState, useEffect } from 'react';
import { Save, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

interface NoteEditorProps {
    note: Note;
    accessToken: string;
    onSaveSuccess: (note: Note, isNew: boolean) => void;
    onDeleteSuccess: () => void;
    onBack: () => void; // For mobile navigation
}

export const NoteEditor = ({ note, accessToken, onSaveSuccess, onDeleteSuccess, onBack }: NoteEditorProps) => {
    // Local state to manage the content being edited
    const [content, setContent] = useState(note.content);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Set local state when a new note prop is selected
    useEffect(() => {
        setContent(note.content);
    }, [note.content]);

    const isNew = note.id === -1;
    const isDirty = content !== note.content;
    const canSave = isDirty && content.trim().length > 0;


    // --- API Handlers ---

    const handleSave = async () => {
        if (!canSave) return;

        setIsSaving(true);
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew 
            ? `${process.env.NEXT_PUBLIC_API_URL}/notes/` 
            : `${process.env.NEXT_PUBLIC_API_URL}/notes/${note.id}/`;

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ content: content.trim() }),
            });
            
            if (!res.ok) throw new Error("Failed to save note.");
            
            const savedNote: Note = await res.json();
            onSaveSuccess(savedNote, isNew);

        } catch (error: any) {
            toast.error(error.message || "Error saving note.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (isNew) {
            // If it's a new unsaved note, just clear it locally
            onDeleteSuccess(); 
            return;
        }

        if (!confirm('Are you sure you want to delete this note?')) return;

        setIsDeleting(true);
        try {
            // Your Django URL: /api/notes/<int:pk>/
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/notes/${note.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${accessToken}` },
            });

            if (!res.ok && res.status !== 204) throw new Error("Failed to delete note.");

            onDeleteSuccess();

        } catch (error: any) {
            toast.error(error.message || "Error deleting note.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-4 sm:p-6">
            
            {/* Header: Back Button (Mobile), Title & Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center">
                    <button 
                        onClick={onBack} 
                        className="md:hidden p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-semibold text-gray-800 truncate max-w-[calc(100vw-200px)] md:max-w-none">
                        {isNew ? 'Create New Note' : note.title || 'Untitled Note'}
                    </h2>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className={`p-2 rounded-full transition ${isDeleting ? 'text-red-400' : 'text-red-500 hover:bg-red-50 hover:text-red-600'}`}
                        title={isNew ? 'Discard Draft' : 'Delete Note'}
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                    
                    <button
                        onClick={handleSave}
                        disabled={!canSave || isSaving || isDeleting}
                        className={`flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-lg transition 
                            ${canSave && !isSaving 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Content Textarea */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note here..."
                className="flex-1 w-full mt-4 p-4 text-lg border-none focus:ring-0 resize-none outline-none overflow-y-auto font-sans leading-relaxed"
                style={{ minHeight: 'calc(100% - 60px)' }} // Ensure it fills the remaining space
                autoFocus
            />

            {/* Footer Status */}
            <div className="mt-4 pt-2 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>{content.length} characters</span>
                <span className={isDirty ? 'text-indigo-600' : ''}>
                    {isDirty ? 'Unsaved Changes' : `Last saved: ${new Date(note.updated_at).toLocaleTimeString()}`}
                </span>
            </div>
        </div>
    );
};