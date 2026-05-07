import { CreditCard, ScanFace } from 'lucide-react';

export default function PhaseStepper({ latestScan }) {
  const isScanning = latestScan?.status === 'scanning';
  const isApproved = latestScan?.status === 'approved' || latestScan?.status === 'Access Granted';
  const isEarlyReject = latestScan?.status === 'invalid_schedule';
  const isError = latestScan && !isScanning && !isApproved && !isEarlyReject;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex items-center justify-between px-6 shrink-0 w-full max-w-xl mx-auto">
      
      {/* Phase 1: Barcode/ID Scan */}
      <div className={`flex flex-col items-center gap-2 transition-all ${latestScan ? 'opacity-100' : 'opacity-40'}`}>
         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${latestScan ? (isEarlyReject ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-emerald-100 border-emerald-200 text-emerald-600') : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
           <CreditCard size={20} />
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">ID Scan</span>
      </div>

      {/* Animated Connecting Line */}
      <div className={`h-1 flex-1 mx-4 rounded-full transition-all ${isScanning ? 'bg-blue-200 relative overflow-hidden' : (latestScan && !isEarlyReject) ? 'bg-emerald-200' : 'bg-slate-200'}`}>
         {isScanning && <div className="absolute inset-0 bg-blue-500 animate-[scan_1.5s_ease-in-out_infinite]"></div>}
      </div>

      {/* Phase 2: Face Match */}
      <div className={`flex flex-col items-center gap-2 transition-all ${isScanning ? 'scale-110' : (!latestScan || isEarlyReject) ? 'opacity-40' : 'opacity-100'}`}>
         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
            isScanning ? 'bg-blue-100 border-blue-300 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
            isApproved ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 
            isError ? 'bg-rose-100 border-rose-200 text-rose-600' : 
            'bg-slate-100 border-slate-200 text-slate-400'
         }`}>
           <ScanFace size={20} className={isScanning ? 'animate-pulse' : ''} />
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Face Match</span>
      </div>

    </div>
  );
}