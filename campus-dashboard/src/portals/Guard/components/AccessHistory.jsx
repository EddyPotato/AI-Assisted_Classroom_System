import { Clock, Filter } from 'lucide-react';
import AccessLogEntry from './AccessLogEntry';

export default function AccessHistory({ logs }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Clock className="text-blue-600" size={24} /> Full Access History
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">Complete audit trail of all campus gate events.</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-slate-50 transition-colors shadow-sm">
          <Filter size={16} /> Filter Logs
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-slate-50/50">
        {logs.length === 0 ? (
          <div className="text-center text-slate-400 font-bold mt-20">No historical records available.</div>
        ) : (
          logs.map((entry, idx) => (
            <AccessLogEntry key={idx} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}