import { ImageOff, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerificationPanel({ latestScan, cacheBuster }) {
  if (!latestScan) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 flex flex-col items-center shrink-0 shadow-sm min-h-72 justify-center">
        <ScanLine size={48} className="mb-4 opacity-30" />
        <p className="font-bold text-slate-500">System Ready</p>
        <p className="text-xs mt-1 font-medium text-slate-400">Awaiting scan or manual entry...</p>
      </div>
    );
  }

  const isScanning = latestScan.status === 'scanning';
  const isMissing = latestScan.status === 'missing_face';
  const isApproved = latestScan.status === 'approved' || latestScan.status === 'Access Granted';

  return (
    <div className={`border rounded-2xl p-5 shadow-sm transition-all duration-300 shrink-0 flex flex-col ${isScanning ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20' : isMissing ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : isApproved ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'}`}>
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 text-center">
         {isScanning ? 'Analyzing Biometrics...' : isMissing ? 'Error: Missing Data' : 'Verification Result'}
      </h2>
      
      {/* Massive Profile Picture */}
      <div className="w-full aspect-square max-w-64 mx-auto bg-white rounded-2xl border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative mb-4">
        {latestScan.face_reference_path ? (
          <img 
            src={`http://localhost:5106/ReferenceFaces/${latestScan.face_reference_path}?t=${cacheBuster}`} 
            className={`w-full h-full object-cover ${isScanning ? 'opacity-40 grayscale blur-sm' : ''}`} 
            alt="Student" 
          />
        ) : (
          <ImageOff size={48} className="text-slate-300" />
        )}
        
        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500/10 backdrop-blur-[1px]">
             <ScanLine size={40} className="text-blue-600 animate-ping mb-2" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="text-center mb-4">
        <h3 className="text-2xl font-black text-slate-900 leading-tight">{latestScan.first_name} {latestScan.last_name}</h3>
        <p className="text-slate-500 font-bold text-sm mt-1">{latestScan.student_id}</p>
      </div>
      
      {/* Status Badge */}
      <div className={`p-3 rounded-xl font-black flex items-center justify-center gap-2 w-full text-white shadow-sm mt-auto ${isScanning ? 'bg-blue-600 animate-pulse' : isMissing ? 'bg-amber-500' : isApproved ? 'bg-emerald-600' : 'bg-rose-600'}`}>
        {isScanning ? <ScanLine size={18} className="animate-spin" /> : isMissing ? <AlertCircle size={18} /> : isApproved ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        {isScanning ? 'ANALYZING...' : isMissing ? 'NO REGISTERED PHOTO' : isApproved ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
      </div>
    </div>
  );
}