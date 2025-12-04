"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Save, Brain, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarCreated: () => void; // Callback to refresh avatar list
}

export const AvatarCreationModal = ({ isOpen, onClose, onAvatarCreated }: AvatarCreationModalProps) => {
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [tone, setTone] = useState("friendly"); // Default to friendly
  const [personaPrompt, setPersonaPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

  const TONE_CHOICES = [
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly (Default)" },
    { value: "professional", label: "Professional" },
    { value: "witty", label: "Witty" },
    { value: "formal", label: "Formal" },
  ];

  // --- Handle Availability Check ---
  const checkHandleAvailability = async (newHandle: string) => {
    if (!newHandle.trim()) {
        setHandleAvailable(null);
        return;
    }
    // Simple placeholder check (usually a dedicated GET endpoint is better)
    if (newHandle.toLowerCase() === 'admin' || newHandle.length < 3) {
        setHandleAvailable(false);
        return;
    }
    // In a real app, this would be a debounce-controlled API call:
    // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/check-handle/?handle=${newHandle}`);
    // setHandleAvailable(res.ok);
    
    // For now, assume available if basic checks pass
    setHandleAvailable(true);
  };
  
  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHandle = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setHandle(newHandle);
      setHandleAvailable(null); // Reset until check runs
      checkHandleAvailability(newHandle);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || loading || handleAvailable === false) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
            name, 
            handle, 
            tone, 
            persona_prompt: personaPrompt 
        }),
      });

      console.log("Avatar creation payload:", { 
        name, 
        handle, 
        tone, 
        persona_prompt: personaPrompt 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create avatar. Handle may already be taken.");
      }

      toast.success("Avatar created successfully!");
      onAvatarCreated(); 
      onClose(); 
      // Reset form on success
      setName("");
      setHandle("");
      setTone("friendly");
      setPersonaPrompt("");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="w-7 h-7 text-emerald-600" />
            Create Your AI Avatar
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
          {/* Avatar Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Avatar Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., 'John's AI Assistant'"
            />
          </div>

          {/* Handle */}
          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
              Unique Handle (`/a/{handle}/`)
            </label>
            <div className="relative">
                <input
                type="text"
                id="handle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition pr-10"
                value={handle}
                onChange={handleHandleChange}
                required
                disabled={loading}
                placeholder="e.g., john-ai"
                />
                {handleAvailable !== null && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {handleAvailable ? (
                            <Check className="w-5 h-5 text-green-500" />
                        ) : (
                            <X className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                )}
            </div>
            {handleAvailable === false && (
                <p className="text-xs text-red-600 mt-1">This handle is invalid or already taken.</p>
            )}
          </div>

          {/* Tone */}
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              **Default Tone/Style**
            </label>
            <select
              id="tone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={loading}
            >
              {TONE_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>

          {/* Persona Prompt */}
          <div>
            <label htmlFor="personaPrompt" className="block text-sm font-medium text-gray-700 mb-1">
              **Persona Prompt** (High-level instruction)
            </label>
            <textarea
              id="personaPrompt"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
              value={personaPrompt}
              onChange={(e) => setPersonaPrompt(e.target.value)}
              placeholder="e.g., 'You are a concise business advisor who prioritizes actionable steps.'"
              disabled={loading}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">This overrides the general Assistant personality.</p>
          </div>
          
        </form>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-100 gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
            disabled={loading || !handle.trim() || handleAvailable === false || !name.trim()}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {loading ? "Creating..." : "Create Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// "use client";

// import React, { useState, useMemo } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { X, Save, Brain, Loader2, Check, Ruler, Zap, Database } from "lucide-react";
// import toast from "react-hot-toast";

// // Helper function to convert Django choices array to a usable object map
// const mapChoices = (choicesArray: [string, string][]) => 
//   choicesArray.map(([value, label]) => ({ value, label }));

// // Define the Choices based on your Django model
// const AVATAR_TYPES: [string, string][] = [
//     ["personal", "Personal Assistant"],
//     ["business", "Business Assistant"],
//     ["customer_support", "Customer Support Agent"],
//     ["education", "Tutor / Learning Assistant"],
//     ["creative", "Creative Assistant"],
//     ["health", "Lifestyle & Wellness"],
//     ["companion", "Social Companion"],
//     ["developer", "Developer Assistant"],
// ];

// const AVATAR_SUBTYPES = {
//     personal: [
//         ["productivity", "Productivity Assistant"],
//         ["life_assistant", "Daily Life Assistant"],
//         ["scheduler", "Scheduling Assistant"],
//     ],
//     business: [
//         ["operations", "Operations Assistant"],
//         ["marketing", "Marketing Assistant"],
//         ["sales", "Sales Assistant"],
//         ["hr", "HR Assistant"],
//     ],
//     customer_support: [
//         ["support_agent", "General Support Agent"],
//     ],
//     education: [
//         ["general_tutor", "General Tutor"],
//         ["math_tutor", "Math Tutor"],
//         ["study_coach", "Study Coach"],
//     ],
//     creative: [
//         ["content_creator", "Content Assistant"],
//         ["writer", "Writing Assistant"],
//         ["designer", "Design Assistant"],
//     ],
//     health: [
//         ["fitness", "Fitness Coach"],
//         ["nutrition", "Nutrition Assistant"],
//         ["mindset", "Mindset Coach"],
//     ],
//     companion: [
//         ["friendly_companion", "Friendly Companion"],
//         ["motivational_companion", "Motivational Companion"],
//     ],
//     developer: [
//         ["coding", "Coding Assistant"],
//         ["tech_support", "Technical Support"],
//     ],
// };

// const TONE_CHOICES = [
//     { value: "casual", label: "Casual" },
//     { value: "friendly", label: "Friendly (Default)" },
//     { value: "professional", label: "Professional" },
//     { value: "witty", label: "Witty" },
//     { value: "formal", label: "Formal" },
//     { value: "custom", label: "Custom" },
// ];

// const MEMORY_DEPTH_CHOICES = [
//     { value: 1, label: "Shallow (Short-term only)" },
//     { value: 2, label: "Medium" },
//     { value: 3, label: "Deep (Default)" },
//     { value: 4, label: "Very Deep" },
//     { value: 5, label: "Maximal (Long-term retention)" },
// ];


// interface AvatarCreationModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onAvatarCreated: () => void; // Callback to refresh avatar list
// }

// export const AvatarCreationModal = ({ isOpen, onClose, onAvatarCreated }: AvatarCreationModalProps) => {
//   const { accessToken } = useAuth();
  
//   // Basic Fields
//   const [name, setName] = useState("");
//   const [handle, setHandle] = useState("");
//   const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);

//   // New Avatar Configuration Fields
//   const [avatarType, setAvatarType] = useState("personal"); 
//   const [avatarSubtype, setAvatarSubtype] = useState("productivity");
//   const [tone, setTone] = useState("friendly"); 
//   const [userInstructions, setUserInstructions] = useState(""); // Replaced personaPrompt
  
//   // Capabilities/Settings
//   const [allowMemory, setAllowMemory] = useState(true); // Default to True per model
//   const [memoryDepth, setMemoryDepth] = useState(3);
//   const [allowTasks, setAllowTasks] = useState(false);
//   const [allowAppointments, setAllowAppointments] = useState(false);
//   const [allowOrders, setAllowOrders] = useState(false);


//   const [loading, setLoading] = useState(false);

//   // Dynamic Subtype Choices
//   const subtypeChoices = useMemo(() => {
//     const subtypes = (AVATAR_SUBTYPES as any)[avatarType] || [];
//     return mapChoices(subtypes);
//   }, [avatarType]);

//   // Set default subtype when the main type changes
//   const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newType = e.target.value;
//     setAvatarType(newType);
//     // Set a default subtype for the new type
//     const newSubtypes = (AVATAR_SUBTYPES as any)[newType];
//     if (newSubtypes && newSubtypes.length > 0) {
//       setAvatarSubtype(newSubtypes[0][0]);
//     } else {
//       setAvatarSubtype("");
//     }
//   };

//   // --- Handle Availability Check ---
//   const checkHandleAvailability = (newHandle: string) => {
//     if (!newHandle.trim()) {
//         setHandleAvailable(null);
//         return;
//     }
//     // Simple placeholder check (usually a dedicated GET endpoint is better)
//     // Removed 'admin' check, but kept length check for realism
//     if (newHandle.length < 3) {
//         setHandleAvailable(false);
//         return;
//     }
    
//     // For now, assume available if basic checks pass
//     setHandleAvailable(true);
//   };
  
//   const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//       // Allow only lowercase letters, numbers, and hyphens
//       const newHandle = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
//       setHandle(newHandle);
//       setHandleAvailable(null); // Reset until check runs
//       checkHandleAvailability(newHandle);
//   };


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!accessToken || loading || handleAvailable === false) return;

//     setLoading(true);
//     try {
//       const payload = {
//           name, 
//           handle, 
//           tone, 
//           avatar_type: avatarType,
//           avatar_subtype: avatarSubtype,
//           user_instructions: userInstructions,
//           allow_memory: allowMemory,
//           memory_depth: allowMemory ? memoryDepth : 1, // Set to 1 if memory is disabled
//           allow_tasks: allowTasks,
//           allow_appointments: allowAppointments,
//           allow_orders: allowOrders,
//       };

//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || "Failed to create avatar. Handle may already be taken.");
//       }

//       toast.success("Avatar created successfully!");
//       onAvatarCreated(); 
//       onClose(); 
//       // Reset form on success
//       setName("");
//       setHandle("");
//       setAvatarType("personal");
//       setAvatarSubtype("productivity");
//       setTone("friendly");
//       setUserInstructions("");
//       setAllowMemory(true);
//       setMemoryDepth(3);
//       setAllowTasks(false);
//       setAllowAppointments(false);
//       setAllowOrders(false);

//     } catch (error: any) {
//       toast.error(error.message || "An unexpected error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        
//         {/* Modal Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
//           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
//             <Brain className="w-7 h-7 text-emerald-600" />
//             Create Your AI Avatar
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
//             disabled={loading}
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Modal Body - Form */}
//         <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">

//           {/* Core Identity Section */}
//           <div className="space-y-5">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Ruler className="w-5 h-5 text-emerald-500" /> Identity
//             </h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               {/* Avatar Name */}
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                   **Avatar Name**
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required
//                   disabled={loading}
//                   placeholder="e.g., 'John's AI Assistant'"
//                 />
//               </div>

//               {/* Handle */}
//               <div>
//                 <label htmlFor="handle" className="block text-sm font-medium text-gray-700 mb-1">
//                   **Unique Handle** (`/a/{handle || '...'}/`)
//                 </label>
//                 <div className="relative">
//                     <input
//                     type="text"
//                     id="handle"
//                     className={`w-full px-4 py-2 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition pr-10 ${
//                         handleAvailable === false ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     value={handle}
//                     onChange={handleHandleChange}
//                     required
//                     disabled={loading}
//                     placeholder="e.g., john-ai"
//                     />
//                     {handleAvailable !== null && handle.length >= 3 && (
//                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                             {handleAvailable ? (
//                                 <Check className="w-5 h-5 text-green-500" />
//                             ) : (
//                                 <X className="w-5 h-5 text-red-500" />
//                             )}
//                         </div>
//                     )}
//                 </div>
//                 {handleAvailable === false && handle.length > 0 && (
//                     <p className="text-xs text-red-600 mt-1">This handle is invalid (must be 3+ chars) or already taken.</p>
//                 )}
//               </div>
//             </div>
//           </div>
          
//           <hr className="border-gray-100" />

//           {/* Personality & Purpose Section */}
//           <div className="space-y-5">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Zap className="w-5 h-5 text-indigo-500" /> Personality & Purpose
//             </h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//               {/* Avatar Type */}
//               <div>
//                 <label htmlFor="avatarType" className="block text-sm font-medium text-gray-700 mb-1">
//                   **Category**
//                 </label>
//                 <select
//                   id="avatarType"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
//                   value={avatarType}
//                   onChange={handleTypeChange}
//                   disabled={loading}
//                 >
//                   {mapChoices(AVATAR_TYPES).map((choice) => (
//                     <option key={choice.value} value={choice.value}>
//                       {choice.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Avatar Subtype */}
//               <div>
//                 <label htmlFor="avatarSubtype" className="block text-sm font-medium text-gray-700 mb-1">
//                   **Specific Role**
//                 </label>
//                 <select
//                   id="avatarSubtype"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
//                   value={avatarSubtype}
//                   onChange={(e) => setAvatarSubtype(e.target.value)}
//                   disabled={loading}
//                 >
//                   {subtypeChoices.map((choice) => (
//                     <option key={choice.value} value={choice.value}>
//                       {choice.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Tone */}
//               <div>
//                 <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
//                   **Default Tone/Style**
//                 </label>
//                 <select
//                   id="tone"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
//                   value={tone}
//                   onChange={(e) => setTone(e.target.value)}
//                   disabled={loading}
//                 >
//                   {TONE_CHOICES.map((choice) => (
//                     <option key={choice.value} value={choice.value}>
//                       {choice.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* User Instructions */}
//             <div>
//               <label htmlFor="userInstructions" className="block text-sm font-medium text-gray-700 mb-1">
//                 **Custom Instructions** (Detailed override)
//               </label>
//               <textarea
//                 id="userInstructions"
//                 rows={3}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
//                 value={userInstructions}
//                 onChange={(e) => setUserInstructions(e.target.value)}
//                 placeholder="e.g., 'Always sign off with your name and offer three related resources.'"
//                 disabled={loading}
//               ></textarea>
//               <p className="text-xs text-gray-500 mt-1">
//                 Use this to give highly specific rules, constraints, or a detailed personality brief.
//               </p>
//             </div>
//           </div>

//           <hr className="border-gray-100" />

//           {/* Capabilities Section */}
//           <div className="space-y-5">
//             <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//               <Database className="w-5 h-5 text-purple-500" /> Advanced Settings
//             </h3>

//             {/* Memory and Depth */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
//               {/* Allow Memory Toggle */}
//               <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg bg-gray-50">
//                 <input
//                   id="allowMemory"
//                   type="checkbox"
//                   className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                   checked={allowMemory}
//                   onChange={(e) => setAllowMemory(e.target.checked)}
//                   disabled={loading}
//                 />
//                 <label htmlFor="allowMemory" className="text-sm font-medium text-gray-900">
//                   **Allow Memory & History**
//                   <p className="text-xs text-gray-500 font-normal">
//                     Allows the avatar to remember past interactions and user details.
//                   </p>
//                 </label>
//               </div>

//               {/* Memory Depth Select */}
//               <div className={allowMemory ? '' : 'opacity-50 pointer-events-none'}>
//                 <label htmlFor="memoryDepth" className="block text-sm font-medium text-gray-700 mb-1">
//                   **Memory Depth**
//                 </label>
//                 <select
//                   id="memoryDepth"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition"
//                   value={memoryDepth}
//                   onChange={(e) => setMemoryDepth(parseInt(e.target.value))}
//                   disabled={loading || !allowMemory}
//                 >
//                   {MEMORY_DEPTH_CHOICES.map((choice) => (
//                     <option key={choice.value} value={choice.value}>
//                       {choice.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Other Capabilities */}
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 {[
//                     { id: 'allowTasks', state: allowTasks, setter: setAllowTasks, label: 'Tasks (To-Do/Projects)' },
//                     { id: 'allowAppointments', state: allowAppointments, setter: setAllowAppointments, label: 'Appointments (Calendar)' },
//                     { id: 'allowOrders', state: allowOrders, setter: setAllowOrders, label: 'Orders (E-commerce/Booking)' },
//                 ].map(({ id, state, setter, label }) => (
//                     <div key={id} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
//                         <input
//                             id={id}
//                             type="checkbox"
//                             className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
//                             checked={state}
//                             onChange={(e) => setter(e.target.checked)}
//                             disabled={loading}
//                         />
//                         <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
//                             {label}
//                         </label>
//                     </div>
//                 ))}
//             </div>
//           </div>

//         </form>

//         {/* Modal Footer */}
//         <div className="flex justify-end p-6 border-t border-gray-100 gap-3 sticky bottom-0 bg-white z-10">
//           <button
//             onClick={onClose}
//             className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             onClick={handleSubmit}
//             className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
//             disabled={
//                 loading || 
//                 !handle.trim() || 
//                 handleAvailable === false || 
//                 !name.trim() ||
//                 !avatarSubtype // Ensure a subtype is selected
//             }
//           >
//             {loading ? (
//               <Loader2 className="w-5 h-5 animate-spin" />
//             ) : (
//               <Save className="w-5 h-5" />
//             )}
//             {loading ? "Creating..." : "Create Avatar"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };