import { Edit2, Trash2, ArrowUpDown, ChevronUp, ChevronDown, Clock, MapPin, UserCircle } from 'lucide-react';

export default function SchedulesTab({
  scheduleData,
  searchQuery,
  schedSortConfig,
  onHandleSchedSort,
  onSetZoomedImage,
  cacheBuster,
  onEditSchedule,
  onOpenConfirmSchedModal
}) {
  const filteredSchedule = scheduleData.filter(sched => 
    sched.subject_Code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sched.subject_Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sched.professor_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSchedule = [...filteredSchedule].sort((a, b) => {
    if (!schedSortConfig.key) return 0;
    const aValue = a[schedSortConfig.key] || '';
    const bValue = b[schedSortConfig.key] || '';
    if (aValue < bValue) return schedSortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return schedSortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const renderSchedSortIcon = (key) => {
    if (schedSortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return schedSortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />;
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse min-w-250">
        <thead>
          <tr className="bg-white text-xs uppercase text-slate-500 font-black border-b-2 border-slate-100 cursor-pointer select-none">
            <th className="p-4 w-28 hover:bg-slate-50 transition-colors outline-none" onClick={() => onHandleSchedSort('subject_Code')}>
              <div className="flex items-center gap-1">Code {renderSchedSortIcon('subject_Code')}</div>
            </th>
            <th className="p-4 w-auto hover:bg-slate-50 transition-colors outline-none" onClick={() => onHandleSchedSort('subject_Title')}>
              <div className="flex items-center gap-1">Subject Title {renderSchedSortIcon('subject_Title')}</div>
            </th>
            <th className="p-4 w-20 text-center hover:bg-slate-50 transition-colors outline-none" onClick={() => onHandleSchedSort('units')}>
              <div className="flex items-center justify-center gap-1">Units {renderSchedSortIcon('units')}</div>
            </th>
            <th className="p-4 w-72 hover:bg-slate-50 transition-colors outline-none" onClick={() => onHandleSchedSort('professor_Name')}>
              <div className="flex items-center gap-1">Assigned Professor {renderSchedSortIcon('professor_Name')}</div>
            </th>
            <th className="p-4 w-64 hover:bg-slate-50 transition-colors outline-none" onClick={() => onHandleSchedSort('time_Start')}>
              <div className="flex items-center gap-1">Schedule & Room {renderSchedSortIcon('time_Start')}</div>
            </th>
            <th className="p-4 w-28 text-center cursor-default outline-none">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sortedSchedule.map((sched) => (
            <tr key={sched.schedule_ID} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-indigo-600 font-mono text-sm">{sched.subject_Code}</td>
              <td className="p-4 font-black text-slate-800 leading-tight">{sched.subject_Title}</td>
              <td className="p-4 font-bold text-slate-500 text-center">{sched.units}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  {sched.professor_Face_Reference_Path && !sched.professor_Face_Reference_Path.includes("C:") ? (
                    <img 
                      src={`http://localhost:5106/ReferenceFaces/${sched.professor_Face_Reference_Path}?t=${cacheBuster}`} 
                      alt="Professor" 
                      onClick={() => onSetZoomedImage(`http://localhost:5106/ReferenceFaces/${sched.professor_Face_Reference_Path}?t=${cacheBuster}`)}
                      className="w-8 h-8 object-cover aspect-square rounded-full border border-slate-200 shadow-sm shrink-0 cursor-zoom-in hover:opacity-80 transition-opacity" 
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 ${sched.professor_Name === 'Unassigned' ? 'bg-rose-50 text-rose-400' : 'bg-slate-100 text-slate-400'}`}>
                      <UserCircle size={16} />
                    </div>
                  )}
                  <span className={`font-bold text-sm ${sched.professor_Name === 'Unassigned' ? 'text-rose-600 italic' : 'text-slate-700'}`}>
                    {sched.professor_Name}
                  </span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <Clock size={14} className="text-amber-500" /> {sched.class_Days} | {sched.time_Start} - {sched.time_End}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <MapPin size={14} className="text-emerald-500" /> Room: {sched.room_ID}
                  </div>
                </div>
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => onEditSchedule(sched)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onOpenConfirmSchedModal(sched.schedule_ID)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {sortedSchedule.length === 0 && (
            <tr><td colSpan="6" className="p-12 text-center text-slate-500 font-bold">No subjects scheduled for this section yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
