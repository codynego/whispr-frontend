"use client";

import { useState } from "react";
import { MessageCircle, RefreshCw, Clock, CheckCircle2 } from "lucide-react";

export default function WhatsAppPage() {
  const [alerts] = useState([
    {
      id: 1,
      subject: "Meeting Confirmation",
      avatar: "MC",
      message: "Meeting with David confirmed for 2 PM.",
      status: "Delivered",
      statusIcon: CheckCircle2,
      time: "Today, 1:45 PM",
    },
    {
      id: 2,
      subject: "Proposal Reminder",
      avatar: "PR",
      message: "Don't forget to send the client proposal.",
      status: "Pending",
      statusIcon: RefreshCw,
      time: "Yesterday, 9:12 AM",
    },
  ]);

  const refreshAlerts = () => {
    // later: fetch new alerts from backend
    console.log("Refreshing alerts...");
  };

interface StatusColorMap {
    [key: string]: string;
}

const getStatusColor = (status: string): string => {
    const statusColors: StatusColorMap = {
        "Delivered": "bg-green-100 text-green-700",
        "Pending": "bg-yellow-100 text-yellow-700"
    };
    
    return statusColors[status] || "bg-gray-100 text-gray-700";
};

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-green-600" />
          WhatsApp Alerts
        </h1>
        <button
          onClick={refreshAlerts}
          className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-slate-100 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 border border-slate-200/50 transition-all hover:shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-indigo-500 group-hover:text-indigo-600" />
          Refresh
        </button>
      </header>

      {/* Alerts List */}
      <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="divide-y divide-slate-200/50">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="p-4 hover:bg-slate-50/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {alert.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate pr-2">{alert.subject}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{alert.message}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(alert.status)}`}>
                        <alert.statusIcon className="w-3 h-3" />
                        {alert.status}
                      </div>
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-gray-400 hover:text-green-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}