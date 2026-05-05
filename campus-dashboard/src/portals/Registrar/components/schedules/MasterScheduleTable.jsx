import { Edit2, Trash2 } from 'lucide-react';

export default function MasterScheduleTable({ schedules, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-200">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200">
            <th className="p-4 w-32">Sched ID</th>
            <th className="p-4">Section</th>
            <th className="p-4">Subject</th>
            <th className="p-4">Professor</th>
            <th className="p-4">Room</th>
            <th className="p-4">Schedule</th>
            <th className="p-4 w-28 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schedules.map((sched) => (
            <tr key={sched.schedule_ID} className="hover:bg-slate-50 transition-colors group">
              <td className="p-4 font-bold text-blue-600 font-mono text-sm">{sched.schedule_ID}</td>
              <td className="p-4 font-black text-slate-800">{sched.section_ID}</td>
              <td className="p-4 font-bold text-slate-700">{sched.subject_Code}</td>
              <td className="p-4 font-medium text-slate-600">{sched.professor_ID || <span className="italic text-slate-400">Unassigned</span>}</td>
              <td className="p-4 font-bold text-emerald-600">{sched.room_ID || '-'}</td>
              <td className="p-4">
                 <div className="text-sm font-bold text-slate-700">{sched.class_Days || 'TBA'}</div>
                 <div className="text-xs font-medium text-slate-500">{sched.time_Start} - {sched.time_End}</div>
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => onEdit(sched)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title="Edit Schedule">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDelete(sched.schedule_ID)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Delete Schedule">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {schedules.length === 0 && (
            <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">No schedules found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}