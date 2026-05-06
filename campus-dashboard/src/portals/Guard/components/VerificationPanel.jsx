import { ImageOff, ScanLine, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';

export default function VerificationPanel({ latestScan, cacheBuster }) {
  if (!latestScan) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center shrink-0 shadow-sm">
        <ScanLine size={32} className="mb-3 opacity-50" />
        <p className="font-bold text-slate-500">Ready for next student</p>
        <p className="text-xs mt-1 font-medium text-slate-400">Please scan ID barcode to begin.</p>
      </div>
    );
  }

  const isScanning = latestScan.status === 'scanning';
  const isMissing = latestScan.status === 'missing_face';
  const isApproved = latestScan.status === 'approved' || latestScan.status === 'Access Granted';

  return (
    <div className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 shrink-0 ${isScanning ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : isMissing ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : isApproved ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'}`}>
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
         {isScanning ? 'Please Look at the Camera...' : isMissing ? 'Error: No Photo Found' : 'Verification Result'}
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
            {latestScan.face_reference_path ? (
              <img src={`http://localhost:5106/ReferenceFaces/${latestScan.face_reference_path}?t=${cacheBuster}`} className={`w-full h-full object-cover ${isScanning ? 'opacity-50 grayscale' : ''}`} alt="Student" />
            ) : (
              <ImageOff size={32} className="text-slate-400" />
            )}
            {isScanning && <div className="absolute inset-0 flex items-center justify-center bg-blue-100/50 backdrop-blur-[2px]"><ScanLine size={24} className="text-blue-600 animate-ping" /></div>}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-900 leading-tight truncate">{latestScan.first_name} <br/> {latestScan.last_name}</h3>
            <p className="text-slate-500 font-bold text-sm mt-1">{latestScan.student_id}</p>
          </div>
        </div>
        
        <div className={`p-3 rounded-xl font-black flex items-center justify-center gap-2 w-full text-white shadow-sm ${isScanning ? 'bg-blue-600 animate-pulse' : isMissing ? 'bg-amber-500' : isApproved ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {isScanning ? <ScanLine size={18} className="animate-spin-slow" /> : isMissing ? <AlertCircle size={18} /> : isApproved ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {isScanning ? 'ANALYZING FACE...' : isMissing ? 'NO REGISTERED PHOTO' : isApproved ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
        </div>
      </div>
    </div>
  );
}