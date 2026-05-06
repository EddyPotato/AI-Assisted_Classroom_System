import { Unlock } from 'lucide-react';

export default function BypassModal({ isOpen, onClose, onSubmit, bypassForm, setBypassForm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
        <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2">
           <Unlock className="text-amber-500" size={24} /> Manual Gate Override
        </h2>
        <p className="text-xs font-bold text-slate-500 mb-6">Log a student without an ID or failed verification.</p>
        
        <div className="space-y-4">
           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Student ID</label>
             <input type="text" placeholder="e.g. 24-1502" value={bypassForm.student_id} onChange={(e) => setBypassForm({...bypassForm, student_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" />
           </div>
           <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reason for Bypass</label>
             <input type="text" placeholder="e.g. Forgotten ID, System Error" value={bypassForm.reason} onChange={(e) => setBypassForm({...bypassForm, reason: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all" />
           </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors border border-slate-200 active:scale-95">Cancel</button>
          <button onClick={onSubmit} disabled={!bypassForm.student_id || !bypassForm.reason} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:hover:bg-amber-500 active:scale-95">Confirm Log</button>
        </div>
      </div>
    </div>
  );
}