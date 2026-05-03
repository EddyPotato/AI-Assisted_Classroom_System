import { X } from 'lucide-react';

export default function FaceZoomModal({ zoomedImage, onClose }) {
  if (!zoomedImage) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
         <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-colors">
           <X size={20} />
         </button>
         <img src={zoomedImage} alt="Face Reference" className="rounded-2xl shadow-2xl max-w-xl max-h-[80vh] border-4 border-white object-cover" />
      </div>
    </div>
  );
}