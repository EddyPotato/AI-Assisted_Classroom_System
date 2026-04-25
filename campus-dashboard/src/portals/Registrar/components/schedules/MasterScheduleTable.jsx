import { Users, Calendar, Building, Edit2 } from 'lucide-react';

export default function MasterScheduleTable({ schedules, handleEditClick }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      {/* ADDED: table-fixed and matching width constraints to mirror Student Directory */}
      <table className="w-full text-left table-fixed border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 tracking-wider">
            {/* ADDED: p-4 padding exactly matching Student Directory */}
            <th className="p-4 w-32">Sched ID</th>
            <th className="p-4">Course Details</th>
            <th className="p-4 w-56">Professor</th>
            <th className="p-4 w-48">Time & Days</th>
            <th className="p-4 w-48">Location</th>
            <th className="p-4 w-24 text-center">Action</th>
          </tr>
        </thead>
        {/* ADDED: divide-y-2 for thicker, visible rows */}
        <tbody className="divide-y-2 divide-slate-100">
          {schedules.map((sched) => (
            <tr key={sched.schedule_ID} className="hover:bg-primary-50/40 transition-colors group">
              <td className="p-4 font-bold text-slate-600 font-mono text-sm">{sched.schedule_ID}</td>
              <td className="p-4">
                {/* Fixed typography sizing to match directory style */}
                <p className="font-black text-slate-800 text-sm truncate">{sched.subject_Code} - {sched.subject_Title}</p>
                <p className="text-xs font-bold text-primary-600 bg-primary-50 inline-block px-2 py-0.5 rounded border border-primary-100 mt-1 shadow-sm">{sched.section_Name}</p>
              </td>
              <td className="p-4 font-bold text-slate-700 truncate">
                 <div className="flex items-center gap-2"><Users size={16} className="text-slate-400 shrink-0"/> {sched.professor_Name}</div>
              </td>
              <td className="p-4 font-medium text-slate-600">
                 <div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-slate-400 shrink-0"/> <span className="text-xs font-bold uppercase">{sched.class_Days}</span></div>
                 <div className="text-sm font-bold text-slate-700">{sched.time_Start} - {sched.time_End}</div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2 font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg w-max shadow-sm text-sm">
                   <Building size={16} className="text-indigo-400 shrink-0"/> {sched.room_ID} <span className="text-indigo-400/80">({sched.building})</span>
                </div>
              </td>
              <td className="p-4 text-center">
                <button onClick={() => handleEditClick(sched)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title="Edit Schedule">
                  <Edit2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {schedules.length === 0 && (
            <tr>
              <td colSpan="6" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">
                 No schedules found. Click "Create Schedule" to assign your first class.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}