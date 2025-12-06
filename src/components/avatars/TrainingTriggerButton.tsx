// "use client";

// import React, { useState } from 'react';
// import { useAuth } from '@/context/AuthContext';
// import { Brain, Loader2 } from 'lucide-react';
// import toast from 'react-hot-toast';

// interface TrainingTriggerButtonProps {
//     avatarHandle: string;
//     isConfigSaved: boolean; // Prop to ensure sources are saved before training
//     onTrainingStart: (jobId: string) => void; // Callback to pass the new job ID to the monitor
// }

// export const TrainingTriggerButton = ({ avatarHandle, isConfigSaved, onTrainingStart }: TrainingTriggerButtonProps) => {
//     const { accessToken } = useAuth();
//     const [loading, setLoading] = useState(false);

//     const handleStartTraining = async () => {
//         if (!accessToken) {
//             toast.error("Authentication required to start training.");
//             return;
//         }

//         setLoading(true);
//         try {
//             // POST /api/avatars/<handle>/train/
//             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avatars/${avatarHandle}/train/`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${accessToken}`,
//                 },
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || "Failed to trigger training job.");
//             }

//             const data = await response.json();
//             const jobId = data.job_id; // Expecting the backend to return the newly created job ID

//             if (jobId) {
//                 toast.success("Training initiated! Monitoring job status...");
//                 onTrainingStart(jobId); // Pass the job ID up to the parent component
//             } else {
//                 throw new Error("Training job ID not returned.");
//             }

//         } catch (error: any) {
//             toast.error(error.message || "An error occurred while starting training.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const isButtonDisabled = loading || !isConfigSaved;

//     return (
//         <div className="flex flex-col items-end">
//             {!isConfigSaved && (
//                 <p className="text-sm text-yellow-600 mb-2">
//                     *Please **Save** your source configuration before starting training.
//                 </p>
//             )}
//             <button
//                 onClick={handleStartTraining}
//                 className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg text-base font-medium hover:bg-indigo-700 transition shadow-md disabled:opacity-50"
//                 disabled={isButtonDisabled}
//             >
//                 {loading ? (
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                 ) : (
//                     <Brain className="w-5 h-5" />
//                 )}
//                 {loading ? "Triggering..." : "Start AI Training"}
//             </button>
//         </div>
//     );
// };