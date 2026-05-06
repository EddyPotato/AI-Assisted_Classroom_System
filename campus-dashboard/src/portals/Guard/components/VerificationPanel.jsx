import { ImageOff, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerificationPanel({ latestScan, cacheBuster }) {
  if (!latestScan) {
    return (
      <div className="w-full aspect-square max-w-xl mx-auto bg-white border border-slate-200 rounded-[2.5rem] p-8 text-center text-slate-400 flex flex-col items-center justify-center shadow-sm">
        <ScanLine size={80} className="mb-6 opacity-30" />
        <p className="font-black text-2xl text-slate-500 tracking-tight">System Ready</p>
        <p className="text-base mt-2 font-medium text-slate-400">Awaiting barcode scan...</p>
      </div>
    );
  }

  const isScanning = latestScan.status === 'scanning';
  const isMissing = latestScan.status === 'missing_face';
  const isApproved = latestScan.status === 'approved' || latestScan.status === 'Access Granted';

  return (
    <div className={`w-full aspect-square max-w-xl mx-auto border rounded-[2.5rem] p-8 shadow-sm transition-all duration-300 flex flex-col justify-between ${isScanning ? 'bg-blue-50 border-blue-300 ring-4 ring-blue-500/20' : isMissing ? 'bg-amber-50 border-amber-300 ring-4 ring-amber-500/20' : isApproved ? 'bg-emerald-50 border-emerald-300 ring-4 ring-emerald-500/20' : 'bg-rose-50 border-rose-300 ring-4 ring-rose-500/20'}`}>
      
      <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mt-2">
         {isScanning ? 'Analyzing Biometrics...' : isMissing ? 'Error: Missing Data' : 'Verification Result'}
      </h2>
      
      {/* Massive Profile Picture */}
      <div className="w-full aspect-square max-w-xs mx-auto bg-white rounded-3xl border-8 border-white shadow-lg flex items-center justify-center overflow-hidden relative mt-4 mb-6">
        {latestScan.face_reference_path ? (
          <img 
            src={`http://localhost:5106/ReferenceFaces/${latestScan.face_reference_path}?t=${cacheBuster}`} 
            className={`w-full h-full object-cover ${isScanning ? 'opacity-40 grayscale blur-md' : ''}`}
            alt="Student" 
          />
        ) : (
          <ImageOff size={64} className="text-slate-300" />
        )}
        
        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500/10 backdrop-blur-[2px]">
             <ScanLine size={64} className="text-blue-600 animate-ping mb-2" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="text-center mb-6">
        <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{latestScan.first_name} {latestScan.last_name}</h3>
        <p className="text-slate-500 font-bold text-lg mt-2 tracking-widest uppercase">{latestScan.student_id}</p>
      </div>
      
      {/* Status Badge */}
      <div className={`p-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 w-full text-white shadow-md mt-auto tracking-widest ${isScanning ? 'bg-blue-600 animate-pulse' : isMissing ? 'bg-amber-500' : isApproved ? 'bg-emerald-600' : 'bg-rose-600'}`}>
        {isScanning ? <ScanLine size={24} className="animate-spin" /> : isMissing ? <AlertCircle size={24} /> : isApproved ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
        {isScanning ? 'ANALYZING...' : isMissing ? 'NO REGISTERED PHOTO' : isApproved ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
      </div>
    </div>
  );
}