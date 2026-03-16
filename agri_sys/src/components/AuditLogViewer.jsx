import React, { useState } from "react";
import { format } from "date-fns";
import { Activity, Clock } from "lucide-react";

export default function AuditLogViewer() {
  const [logs] = useState([]);
  const loading = false;

  if (loading) {
    return <div className="text-sm text-slate-500 animate-pulse">Loading audit history...</div>;
  }

  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-xl">
        <Activity className="w-8 h-8 text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-600">No activity recorded</p>
        <p className="text-xs text-slate-500 mt-1">Changes to this record will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-200 pb-2">History</h3>
      <div className="relative border-l border-slate-200 ml-3 space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-white border-2 border-slate-300 rounded-full" />
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-slate-900">{log.action_label}</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(log.timestamp), "MMM d, yyyy HH:mm")}
              </span>
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {log.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}