import { ArrowLeft, Edit2, Shield, UserCircle, Briefcase } from 'lucide-react';

export default function StaffProfileView({ staff, onBack, onEdit }) {
  if (!staff) return null;

  const fullName = [staff.first_Name, staff.middle_Name, staff.last_Name].filter(Boolean).join(' ');

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff Profile</h2>
            <p className="text-sm font-bold text-slate-500">{staff.user_ID}</p>
          </div>
        </div>
        <button onClick={() => onEdit(staff)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-200 hover:border-amber-500 rounded-xl font-bold text-sm transition-all shadow-sm">
          <Edit2 size={16} /> Edit Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-slate-700 to-slate-900"></div>
          
          <div className="relative mt-8 w-32 h-32 rounded-full border-4 border-white shadow-lg bg-slate-100 overflow-hidden flex items-center justify-center mb-4">
             <UserCircle size={64} className="text-slate-400" />
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1">{fullName}</h3>
          <p className="text-slate-500 font-bold font-mono tracking-widest mb-4">{staff.user_ID}</p>
          
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5">
            <Shield size={14} /> {staff.role}
          </span>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <Briefcase className="text-indigo-500" />
              <h3 className="text-lg font-black text-slate-800">System Activity Logs</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Shield size={48} className="mb-3 opacity-20" />
              <p className="font-medium">System event logs and auditing will be connected here in Phase 2.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}