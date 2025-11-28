// src/components/Notes/NoteList.tsx

import { NotebookText } from 'lucide-react';

interface Note {
    id: number;
    title: string;
    content: string; // Included for type consistency with NotePage
    created_at: string;
    updated_at: string;
}

interface NoteListProps {
    notes: Note[]; // Assumed to be an array, but we guard against non-array values
    selectedNoteId: number | null;
    onSelectNote: (note: Note) => void;
}

export const NoteList = ({ notes, selectedNoteId, onSelectNote }: NoteListProps) => {
    console.log("NoteList received notes:", notes);
    
    // ⭐ CRITICAL FIX: Ensure 'notes' is an array before checking its length or mapping.
    const validNotes = Array.isArray(notes) ? notes : [];
    
    return (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
            
            {validNotes.length === 0 ? (
                // --- Empty State ---
                <div className="p-4 text-center text-gray-500 flex flex-col items-center justify-center h-full min-h-[100px]">
                    <NotebookText className="w-6 h-6 mb-2 text-gray-400" />
                    <p className="text-sm">No notes found. Click &apos;New&apos; to start writing!</p>
                </div>
            ) : (
                // --- Notes List ---
                validNotes.map((note) => (
                    <button
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        // Highlight the selected note
                        className={`w-full text-left p-4 rounded-lg transition-all duration-150
                            ${selectedNoteId === note.id 
                                ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-800' 
                                : 'hover:bg-gray-50 text-gray-900'
                            }`}
                    >
                        <h3 className="font-semibold text-base truncate">
                            {/* Use the dynamically generated 'title' */}
                            {note.title || "Untitled Note"}
                        </h3>
                        <p className={`text-xs mt-1 ${selectedNoteId === note.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                            Last updated: {new Date(note.updated_at).toLocaleDateString()}
                        </p>
                    </button>
                ))
            )}
        </div>
    );
};