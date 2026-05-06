import { Video, ScanLine } from 'lucide-react';

export default function LiveCameraFeed({ latestScan }) {
  return (
    <div className="flex-1 bg-black rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center h-full min-h-[60vh]">
      <img 
        src="http://localhost:5000/video_feed" 
        alt="Live Feed" 
        className="w-full h-full object-cover transform scale-x-[-1]" 
        onError={(e) => e.target.style.display = 'none'} 
      />
      <div className="absolute top-6 right-6 bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-2">
        <Video className="text-blue-400" size={20} /> <span className="text-xs font-black tracking-widest uppercase">Main Gate Cam</span>
      </div>
      
      {/* Central Targeting Reticle */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 border-2 rounded-3xl transition-all duration-300 ${latestScan?.status === 'scanning' ? 'border-blue-400/50 scale-105' : 'border-white/20'}`}>
          <div className={`absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 rounded-tl-xl ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
          <div className={`absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 rounded-tr-xl ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
          <div className={`absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 rounded-bl-xl ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
          <div className={`absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 rounded-br-xl ${latestScan?.status === 'scanning' ? 'border-blue-500' : 'border-white/50'}`}></div>
      </div>
      
      {/* Fallback UI */}
      <div className="absolute inset-0 hidden flex-col items-center justify-center text-slate-400 bg-slate-900 z-10 [img:empty~&]:flex">
        <ScanLine size={64} className="mb-4 animate-pulse opacity-50 text-slate-500" />
        <p className="font-black text-2xl tracking-widest uppercase text-white">Camera Feed Offline</p>
        <p className="text-base mt-2 opacity-70 font-medium">Start vision_node.py on port 5000</p>
      </div>
    </div>
  );
}