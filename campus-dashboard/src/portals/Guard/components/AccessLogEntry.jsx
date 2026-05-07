import { useState } from 'react';

export default function AccessLogEntry({ entry }) {
  const [cacheBuster] = useState(() => Date.now());
  const isApproved = entry.status === "approved" || entry.status === "Access Granted";
  const isBypass = entry.bypass_reason !== null && entry.bypass_reason !== undefined;
  const isNoProfessor = entry.status === "no_professor_yet";

  return (
    <div className={`p-3 rounded-xl border shadow-sm ${isBypass ? 'bg-amber-50 border-amber-200' : isNoProfessor ? 'bg-orange-50 border-orange-200' : isApproved ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
      <div className="flex items-center gap-3">
        {entry.face_reference_path ? (
          <img src={`http://localhost:5106/ReferenceFaces/${entry.face_reference_path}?t=${cacheBuster}`} alt="Face" className="w-10 h-10 rounded-full object-cover border shadow-sm shrink-0" onError={(e) => e.target.style.display = 'none'} />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">?</div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 truncate">{entry.first_name} {entry.last_name}</p>
          <p className="text-xs text-slate-500 font-medium truncate">{entry.student_id}</p>
          {entry.hint && <p className="text-[10px] font-bold text-amber-600 mt-0.5 truncate">{entry.hint}</p>}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md text-white shadow-sm ${isBypass ? 'bg-amber-500' : isNoProfessor ? 'bg-orange-500' : isApproved ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            {isBypass ? '⚠️ BYPASS' : isNoProfessor ? '⏳ WAITING' : isApproved ? '✅ APPROVED' : '❌ DENIED'}
          </span>
          <span className="text-[10px] text-slate-400 font-bold">{entry.timestamp}</span>
        </div>
      </div>
    </div>
  );
}