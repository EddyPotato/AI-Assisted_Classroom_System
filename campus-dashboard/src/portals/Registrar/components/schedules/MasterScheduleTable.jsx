import { Users, Calendar, Building, Edit2 } from 'lucide-react';

export default function MasterScheduleTable({ schedules, handleEditClick }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left min-w-200">
        <thead>
          <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b border-slate-200 tracking-wider">
            <th className="p-5 w-32">Sched ID</th>
            <th className="p-5">Course Details</th>
            <th className="p-5 w-48">Professor</th>
            <th className="p-5 w-48">Time & Days</th>
            <th className="p-5">Location</th>
            <th className="p-5 w-24 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schedules.map((sched) => (
            <tr key={sched.schedule_ID} className="hover:bg-blue-50/30 transition-colors group">
              <td className="p-5 font-bold text-slate-500 font-mono text-sm">{sched.schedule_ID}</td>
              <td className="p-5">
                <p className="font-black text-slate-800 text-base">{sched.subject_Code} - {sched.subject_Title}</p>
                <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2.5 py-0.5 rounded border border-blue-100 mt-1.5 shadow-sm">{sched.section_Name}</p>
              </td>
              <td className="p-5 font-semibold text-slate-700">
                 <div className="flex items-center gap-2"><Users size={16} className="text-slate-400"/> {sched.professor_Name}</div>
              </td>
              <td className="p-5 font-medium text-slate-600">
                 <div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-slate-400"/> <span className="text-xs font-bold uppercase">{sched.class_Days}</span></div>
                 <div className="text-sm">{sched.time_Start} - {sched.time_End}</div>
              </td>
              <td className="p-5">
                <div className="flex items-center gap-2 font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg w-max shadow-sm">
                   <Building size={16} className="text-indigo-400"/> {sched.room_ID} ({sched.building})
                </div>
              </td>
              <td className="p-5 text-center">
                <button onClick={() => handleEditClick(sched)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title="Edit Schedule">
                  <Edit2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {schedules.length === 0 && (
            <tr>
              <td colSpan="6" className="p-10 text-center text-slate-400 font-bold bg-slate-50">
                 No schedules found. Click "Create Schedule" to assign your first class.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}