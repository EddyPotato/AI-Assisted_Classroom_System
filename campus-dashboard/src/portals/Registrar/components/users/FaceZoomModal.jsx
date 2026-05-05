import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function FaceZoomModal({ zoomedImage, onClose }) {
  
  useEffect(() => {
    if (zoomedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [zoomedImage]);

  if (!zoomedImage) return null;

  const modalContent = (
    // THE FIX: Lighter background (slate-900/50) and softer blur (backdrop-blur-sm)
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 select-none cursor-zoom-out"
      onClick={onClose} 
    >
      {/* THE FIX: Removed 'w-full' and 'max-w-3xl' so the wrapper shrinks to fit the image perfectly */}
      <div className="relative p-4 flex flex-col items-center animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute -top-12 right-4 text-white/70 hover:text-white transition-colors p-2 bg-slate-800/50 rounded-full backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* THE FIX: Removed 'w-full', 'ring', and custom shadow. Just a clean max-height and standard shadow. */}
        <img 
          src={zoomedImage} 
          alt="Zoomed Face Reference" 
          className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl pointer-events-none"
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}