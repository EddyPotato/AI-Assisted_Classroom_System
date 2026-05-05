import { useEffect } from 'react';
import { createPortal } from 'react-dom'; // THE FIX: Import createPortal
import { AlertTriangle, Info, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, type, title, message, onConfirm, onCancel }) {
  
  // Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';

  // Extract the modal UI into a variable
  const modalContent = (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 p-3 rounded-full ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
              {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
            </div>
            
            <div className="mt-1">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
              <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            className="px-5 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-5 py-2 font-bold text-white rounded-xl shadow-md transition-all active:scale-95 ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  // THE FIX: "Teleport" the modal directly to the document body
  return createPortal(modalContent, document.body);
}