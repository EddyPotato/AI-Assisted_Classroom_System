import { Clock, MapPin, UserCircle, LibrarySquare } from 'lucide-react';
import { useState } from 'react';

export default function MasterScheduleTable({ schedules, onZoom }) {
  const [cacheBuster] = useState(() => Date.now());

  return (
    <div className="overflow-x-auto w-full">
      {/* THE FIX: Added min-w-[1000px] to prevent crushing */}
      <table className="w-full text-left border-collapse min-w-250">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase text-slate-400 font-black border-b-2 border-slate-200">
            <th className="p-4 w-32">Section</th>
            {/* Subject uses auto to eat remaining width */}
            <th className="p-4 w-auto">Subject</th>
            {/* THE FIX: Renamed Faculty to Professor and adjusted width */}
            <th className="p-4 w-72">Assigned Professor</th>
            <th className="p-4 w-32">Room</th>
            <th className="p-4 w-64">Timetable</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schedules.map((sched) => (
            <tr key={sched.schedule_ID} className="hover:bg-slate-50 transition-colors group">
              
              <td className="p-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-black text-sm tracking-tight border border-blue-200">
                  {sched.section_ID}
                </span>
              </td>

              <td className="p-4">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><LibrarySquare size={14} className="text-indigo-400"/> {sched.subject_Code}</div>
                <div className="text-xs font-bold text-slate-500 truncate" title={sched.subject_Title}>
                  {sched.subject_Title || 'Subject Title'}
                </div>
              </td>

              <td className="p-4">
                {/* THE FIX: Brought in the photo/avatar logic with zoom! */}
                <div className="flex items-center gap-3">
                    {sched.professor_Face_Reference_Path && !sched.professor_Face_Reference_Path.includes("C:") ? (
                    <img 
                        src={`http://localhost:5106/ReferenceFaces/${sched.professor_Face_Reference_Path}?t=${cacheBuster}`} 
                        alt="Professor" 
                        onClick={() => onZoom(`http://localhost:5106/ReferenceFaces/${sched.professor_Face_Reference_Path}?t=${cacheBuster}`)}
                        className="w-8 h-8 object-cover aspect-square rounded-full border border-slate-200 shadow-sm shrink-0 cursor-zoom-in hover:opacity-80 transition-opacity" 
                    />
                    ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 ${sched.professor_Name === 'Unassigned' ? 'bg-rose-50 text-rose-400' : 'bg-slate-100 text-slate-400'}`}>
                        <UserCircle size={16} />
                    </div>
                    )}
                    <span className={`font-bold text-sm ${sched.professor_Name === 'Unassigned' ? 'text-rose-600 italic' : 'text-slate-700'}`}>
                    {sched.professor_Name || sched.professor_ID || 'Unassigned'}
                    </span>
                </div>
              </td>

              <td className="p-4">
                <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-600">
                  <MapPin size={16} /> {sched.room_ID || 'TBA'}
                </div>
              </td>

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