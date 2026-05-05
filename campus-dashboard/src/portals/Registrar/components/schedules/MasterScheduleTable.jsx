import { Clock, MapPin, UserCircle, LibrarySquare } from 'lucide-react';

export default function MasterScheduleTable({ schedules }) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-225">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase text-slate-400 font-black border-b-2 border-slate-200">
            <th className="p-4 w-32">Section</th>
            <th className="p-4 w-48">Subject</th>
            <th className="p-4">Assigned Faculty</th>
            <th className="p-4 w-40">Room</th>
            <th className="p-4 w-56">Timetable</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schedules.map((sched) => (
            <tr key={sched.schedule_ID} className="hover:bg-slate-50 transition-colors group">
              
              {/* Section ID */}
              <td className="p-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-black text-sm tracking-tight border border-blue-200">
                  {sched.section_ID}
                </span>
              </td>

              {/* Subject Info */}
              <td className="p-4">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><LibrarySquare size={14} className="text-indigo-400"/> {sched.subject_Code}</div>
                <div className="text-xs font-bold text-slate-500 truncate max-w-50" title={sched.subject_Title}>
                  {sched.subject_Title || 'Subject Title'}
                </div>
              </td>

              {/* Professor */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <UserCircle size={18} className={sched.professor_Name === 'Unassigned' ? 'text-rose-400' : 'text-slate-400'} />
                  <span className={`font-bold text-sm ${sched.professor_Name === 'Unassigned' ? 'text-rose-600 italic' : 'text-slate-700'}`}>
                    {sched.professor_Name || sched.professor_ID || 'Unassigned'}
                  </span>
                </div>
              </td>

              {/* Room */}
              <td className="p-4">
                <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-600">
                  <MapPin size={16} /> {sched.room_ID || 'TBA'}
                </div>
              </td>

              {/* Timetable */}
              <td className="p-4">
                 <div className="flex flex-col gap-0.5">
                    <div className="text-sm font-bold text-slate-700">{sched.class_Days || 'TBA'}</div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Clock size={12} /> {sched.time_Start} - {sched.time_End}
                    </div>
                 </div>
              </td>
            </tr>
          ))}
          
          {schedules.length === 0 && (
            <tr>
              <td colSpan="5" className="p-12 text-center text-slate-500 font-bold bg-slate-50/50 border-t border-slate-100">
                No schedules match your current global filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}