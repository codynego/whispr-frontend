// src/components/Notes/NoteList.tsx

import { NotebookText } from 'lucide-react';

interface Note {
    id: number;
    title: string;
    content: string; // Include content here for simple state passing, even if not rendered
    created_at: string;
    updated_at: string;
}

interface NoteListProps {
    notes: Note[];
    selectedNoteId: number | null;
    onSelectNote: (note: Note) => void;
}

export const NoteList = ({ notes, selectedNoteId, onSelectNote }: NoteListProps) => {
    return (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
            {notes.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                    No notes found. Start a new one!
                </div>
            ) : (
                notes.map((note) => (
                    <button
                        key={note.id}
                        onClick={() => onSelectNote(note)}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-150
                            ${selectedNoteId === note.id 
                                ? 'bg-indigo-50 border-l-4 border-indigo-600 text-indigo-800' 
                                : 'hover:bg-gray-50 text-gray-900'
                            }`}
                    >
                        <h3 className="font-semibold text-base truncate">
                            {/* Display the dynamic 'title' field from the serializer */}
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