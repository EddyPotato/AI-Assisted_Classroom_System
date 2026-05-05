import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function FaceZoomModal({ zoomedImage, onClose }) {
  
  // THE FIX: Scroll Lock guarantees the background won't move while viewing the image
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
    // THE FIX: Added 'select-none' to prevent blue highlighting on double clicks.
    // Also added 'cursor-zoom-out' so clicking anywhere naturally closes the image.
    <div 
      className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200 select-none cursor-zoom-out"
      onClick={onClose} 
    >
      <div className="relative max-w-3xl w-full p-4 flex flex-col items-center animate-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-4 md:right-0 text-white/70 hover:text-white transition-colors p-2 bg-slate-800/50 rounded-full backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* The Image */}
        {/* THE FIX: 'pointer-events-none' ensures rapid clicking ignores the image and hits the background overlay to close it cleanly without selecting. */}
        <img 
          src={zoomedImage} 
          alt="Zoomed Face Reference" 
          className="w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 pointer-events-none"
        />
      </div>
    </div>
  );

  // THE FIX: "Teleport" the image to the <body> so it covers 100% of the browser
  return createPortal(modalContent, document.body);
}