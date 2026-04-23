import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, type, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`p-6 border-b ${type === 'warning' ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
          <div className="flex items-center gap-3">
            {type === 'warning' ? <AlertTriangle className="text-amber-500" size={28}/> : <CheckCircle className="text-emerald-500" size={28}/>}
            <h3 className="text-xl font-black text-slate-800">{title}</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600 font-medium leading-relaxed">{message}</p>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          {type === 'warning' && (
            <button onClick={onCancel} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
              Cancel
            </button>
          )}
          <button 
            onClick={onConfirm} 
            className={`px-6 py-2 font-bold text-white rounded-lg transition-all shadow-md active:scale-95 ${type === 'warning' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {type === 'warning' ? 'Confirm & Save' : 'Okay'}
          </button>
        </div>
      </div>
    </div>
  );
}