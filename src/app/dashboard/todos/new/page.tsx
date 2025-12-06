// // app/dashboard/todos/new/page.tsx
// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { Loader2, Check } from "lucide-react";

// export default function NewTodo() {
//   const router = useRouter();
//   const { accessToken } = useAuth();

//   const inputRef = useRef<HTMLInputElement>(null);
//   const [task, setTask] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [hasSaved, setHasSaved] = useState(false);

//   // Auto-focus input on mount
//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   const save = async () => {
//     if (!task.trim() || !accessToken || isSaving) return;

//     setIsSaving(true);
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/whisone/todos/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({ task: task.trim() }),
//       });

//       if (!res.ok) {
//         const error = await res.json().catch(() => ({}));
//         throw new Error(error.detail || error.task?.[0] || "Failed to save todo");
//       }

//       setHasSaved(true);
//       setTimeout(() => {
//         router.push("/dashboard/todos");
//       }, 400); // Small delay for success visual feedback
//     } catch (err) {
//       console.error("Failed to create todo:", err);
//       alert("Could not save todo. Please try again.");
//       setIsSaving(false);
//     }
//   };

//   // Allow saving with Enter, cancel with Escape
//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       save();
//     } else if (e.key === "Escape") {
//       router.push("/dashboard/todos");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
//         <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
//           <button
//             onClick={() => router.push("/dashboard/todos")}
//             className="text-gray-600 hover:bg-gray-100 rounded-xl px-5 py-2.5 transition font-medium"
//             disabled={isSaving}
//           >
//             Cancel
//           </button>

//           <button
//             onClick={save}
//             disabled={!task.trim() || isSaving || hasSaved}
//             className="flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
//           >
//             {isSaving ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Saving...
//               </>
//             ) : hasSaved ? (
//               <>
//                 <Check className="w-4 h-4" />
//                 Saved!
//               </>
//             ) : (
//               "Save Todo"
//             )}
//           </button>
//         </div>
//       </header>

//       <main className="max-w-4xl mx-auto px-6 py-12">
//         <input
//           ref={inputRef}
//           type="text"
//           value={task}
//           onChange={(e) => setTask(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="What needs to be done?"
//           className="w-full text-3xl font-medium text-gray-900 bg-transparent outline-none placeholder-gray-400 caret-emerald-600 resize-none"
//           autoFocus
//           disabled={isSaving || hasSaved}
//         />

//         <p className="mt-6 text-sm text-gray-500">
//           Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">Enter</kbd> to save •{" "}
//           <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">Esc</kbd> to cancel
//         </p>
//       </main>
//     </div>
//   );
// }