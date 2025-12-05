"use client";

import { useState, useEffect, useCallback } from 'react';
import { Plus, CheckCircle2, Circle, Loader2, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';

interface Todo {
    id: number;
    task: string;
    done: boolean;
    created_at: string;
    updated_at: string;
    title: string;
}

// Mock Auth Context
import { useAuth } from "@/context/AuthContext";

export default function TodoPage() {
    const { accessToken } = useAuth();
    
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedTask, setEditedTask] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

    // Fetch Todos
    const fetchTodos = useCallback(async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!res.ok) throw new Error("Failed to fetch todos.");
            
            const data: Todo[] = await res.json();
            setTodos(data);
        } catch (error) {
            console.error("Could not load todos:", error);
        } finally {
            setLoading(false);
        }
    }, [accessToken]);
    
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Add Todo
    const handleAddTodo = async () => {
        if (!newTask.trim() || !accessToken) return;
        
        setIsAdding(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: newTask, done: false }),
            });
            
            if (!res.ok) throw new Error("Failed to create todo.");
            
            setNewTask('');
            fetchTodos();
        } catch (error) {
            console.error("Could not create todo:", error);
        } finally {
            setIsAdding(false);
        }
    };

    // Toggle Todo
    const handleToggleTodo = async (todo: Todo) => {
        if (!accessToken) return;
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/${todo.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: todo.task, done: !todo.done }),
            });
            
            if (!res.ok) throw new Error("Failed to update todo.");
            
            fetchTodos();
        } catch (error) {
            console.error("Could not update todo:", error);
        }
    };

    // Update Todo
    const handleUpdateTodo = async (id: number) => {
        if (!editedTask.trim() || !accessToken) return;
        
        try {
            const todo = todos.find(t => t.id === id);
            if (!todo) return;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/${id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: editedTask, done: todo.done }),
            });
            
            if (!res.ok) throw new Error("Failed to update todo.");
            
            setEditingId(null);
            setEditedTask('');
            fetchTodos();
        } catch (error) {
            console.error("Could not update todo:", error);
        }
    };

    // Delete Todo
    const handleDeleteTodo = async (id: number) => {
        if (!accessToken) return;
        
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/${id}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (!res.ok) throw new Error("Failed to delete todo.");
            
            fetchTodos();
        } catch (error) {
            console.error("Could not delete todo:", error);
        }
    };

    // Filter todos
    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.done;
        if (filter === 'completed') return todo.done;
        return true;
    });

    const completedCount = todos.filter(t => t.done).length;
    const activeCount = todos.filter(t => !t.done).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Tasks</h1>
                    <p className="text-gray-600">
                        {activeCount} active · {completedCount} completed
                    </p>
                </div>

                {/* Add New Todo */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                            placeholder="Add a new task..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <button
                            onClick={handleAddTodo}
                            disabled={isAdding || !newTask.trim()}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {isAdding ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            Add
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'active', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                                filter === f
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Todo List */}
                <div className="space-y-3">
                    {filteredTodos.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">
                                {filter === 'completed' 
                                    ? 'No completed tasks yet' 
                                    : filter === 'active'
                                    ? 'No active tasks'
                                    : 'No tasks yet. Add one to get started!'}
                            </p>
                        </div>
                    ) : (
                        filteredTodos.map((todo) => (
                            <div
                                key={todo.id}
                                className={`bg-white rounded-xl shadow-sm p-4 transition hover:shadow-md ${
                                    todo.done ? 'opacity-60' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => handleToggleTodo(todo)}
                                        className="flex-shrink-0"
                                    >
                                        {todo.done ? (
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        ) : (
                                            <Circle className="w-6 h-6 text-gray-300 hover:text-emerald-500 transition" />
                                        )}
                                    </button>

                                    {/* Task Content */}
                                    {editingId === todo.id ? (
                                        <input
                                            type="text"
                                            value={editedTask}
                                            onChange={(e) => setEditedTask(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateTodo(todo.id)}
                                            className="flex-1 px-3 py-2 border border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex-1">
                                            <p className={`text-gray-900 ${todo.done ? 'line-through' : ''}`}>
                                                {todo.task}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                <Calendar className="w-3 h-3 inline mr-1" />
                                                {new Date(todo.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {editingId === todo.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateTodo(todo.id)}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditedTask('');
                                                    }}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(todo.id);
                                                        setEditedTask(todo.task);
                                                    }}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTodo(todo.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}