import { Video, VideoOff, Maximize, Minimize } from 'lucide-react';

export default function ActionButtons({ streamStatus, onStart, onStop, isFullscreen, toggleFullscreen }) {
  return (
    <div className="flex items-center gap-2 w-full xl:w-auto shrink-0">
      {streamStatus === 'active' || streamStatus === 'loading' ? (
        <button 
          onClick={onStop}
          className="flex-1 xl:flex-none flex items-center justify-center gap-2 font-black text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border transition-colors active:scale-95 whitespace-nowrap shadow-sm bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200"
        >
          <VideoOff size={18} strokeWidth={2.5} /> Stop Monitoring
        </button>
      ) : (
        <button 
          onClick={onStart}
          className="flex-1 xl:flex-none flex items-center justify-center gap-2 font-black text-sm sm:text-base px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border transition-colors active:scale-95 whitespace-nowrap shadow-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200"
        >
          <Video size={18} strokeWidth={2.5} /> Start Monitoring
        </button>
      )}

      {/* Kept the button logic, but forced it to stay light themed */}
      <button 
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Enterprise Kiosk Mode"}
        className="flex items-center justify-center p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-colors active:scale-95 shadow-sm shrink-0 bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200"
      >
        {isFullscreen ? <Minimize size={20} strokeWidth={2.5} /> : <Maximize size={20} strokeWidth={2.5} />}
      </button>
    </div>
  );
}