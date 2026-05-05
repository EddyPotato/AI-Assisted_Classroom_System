import { useState } from 'react';
import { ArrowLeft, Edit2, Shield, UserCircle, Briefcase, Mail, Phone, MapPin, CheckCircle2, XCircle } from 'lucide-react';

export default function StaffProfileView({ staff, onBack, onEdit }) {
  // Use local state for cache busting to ensure the image updates immediately after edits
  const [cacheBuster] = useState(() => Date.now());

  if (!staff) return null;

  const fullName = [staff.first_Name, staff.middle_Name, staff.last_Name].filter(Boolean).join(' ');
  
  const imageUrl = staff.face_Reference_Path && !staff.face_Reference_Path.includes("C:")
    ? `http://localhost:5106/ReferenceFaces/${staff.face_Reference_Path}?t=${staff._cacheBuster || cacheBuster}`
    : null;

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff Profile</h2>
            <p className="text-sm font-bold text-slate-500">{staff.user_ID}</p>
          </div>
        </div>
        <button onClick={() => onEdit(staff)} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-200 hover:border-amber-500 rounded-xl font-bold text-sm transition-all shadow-sm w-full sm:w-auto active:scale-95">
          <Edit2 size={16} /> Edit Account
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: ID Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden self-start">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-700 to-slate-900"></div>
          
          <div className="relative mt-8 w-32 h-32 rounded-full border-4 border-white shadow-xl bg-slate-100 overflow-hidden flex items-center justify-center mb-4">
            {imageUrl ? (
              <img src={imageUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <UserCircle size={64} className="text-slate-400" />
            )}
          </div>
          
          <h3 className="text-2xl font-black text-slate-800 leading-tight mb-1">{fullName}</h3>
          <p className="text-slate-500 font-bold font-mono tracking-widest mb-5">{staff.user_ID}</p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border bg-indigo-50 text-indigo-700 border-indigo-200 flex items-center gap-1.5">
              <Shield size={14} /> {staff.role}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-1.5 ${
              staff.status === 'Inactive' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {staff.status === 'Inactive' ? <XCircle size={14} /> : <CheckCircle2 size={14} />} {staff.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
              <UserCircle className="text-blue-500" />
              <h3 className="text-lg font-black text-slate-800">Contact Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                  <Mail size={14}/> Email Address
                </p>
                <p className="font-bold text-slate-800">{staff.email || <span className="text-slate-400 italic font-medium">Not provided</span>}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                  <Phone size={14}/> Contact Number
                </p>
                <p className="font-bold text-slate-800">{staff.contact_Number || <span className="text-slate-400 italic font-medium">Not provided</span>}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                  <MapPin size={14}/> Home Address
                </p>
                <p className="font-bold text-slate-800 leading-relaxed max-w-lg">{staff.address || <span className="text-slate-400 italic font-medium">Not provided</span>}</p>
              </div>
            </div>
          </div>

          {/* System Activity Logs Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full min-h-[250px]">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <Briefcase className="text-indigo-500" />
              <h3 className="text-lg font-black text-slate-800">System Activity Logs</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Shield size={48} className="mb-3 opacity-20" />
              <p className="font-medium text-center">System event logs and auditing will be connected here in Phase 2.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}