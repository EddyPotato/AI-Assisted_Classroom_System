import { ImageOff, ScanLine, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VerificationPanel({ latestScan, cacheBuster }) {
  if (!latestScan) {
    return (
      <div className="w-full max-w-xl aspect-square lg:h-full lg:w-auto lg:max-h-full lg:max-w-full mx-auto bg-white border border-slate-200 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-center text-slate-400 flex flex-col items-center justify-center shadow-sm">
        <ScanLine className="mb-5 sm:mb-6 opacity-30 w-14 h-14 lg:w-20 lg:h-20" />
        <p className="font-black text-xl sm:text-2xl text-slate-500 tracking-tight">System Ready</p>
        <p className="text-sm sm:text-base mt-2 font-medium text-slate-400">Awaiting barcode scan...</p>
      </div>
    );
  }

  const isScanning = latestScan.status === 'scanning';
  const isMissing = latestScan.status === 'missing_face';
  const isApproved = latestScan.status === 'approved' || latestScan.status === 'Access Granted';
  const isNoProfessor = latestScan.status === 'no_professor_yet';
  const isCutting = latestScan.status === 'cutting';

  return (
    <div className={`w-full max-w-xl aspect-square lg:h-full lg:w-auto lg:max-h-full lg:max-w-full mx-auto border rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-5 lg:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between overflow-y-auto overflow-x-hidden ${isScanning ? 'bg-blue-50 border-blue-300 ring-4 ring-blue-500/20' : isMissing ? 'bg-amber-50 border-amber-300 ring-4 ring-amber-500/20' : isNoProfessor ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-500/30' : isApproved ? 'bg-emerald-50 border-emerald-300 ring-4 ring-emerald-500/20' : 'bg-rose-50 border-rose-300 ring-4 ring-rose-500/20'}`}>
      
      <h2 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest text-center mt-0 lg:mt-2 shrink-0">
         {isScanning ? 'Analyzing Biometrics...' : isMissing ? 'Error: Missing Data' : isNoProfessor ? 'Access Paused' : 'Verification Result'}
      </h2>
      
      {/* Massive Profile Picture */}
      <div className="w-[clamp(7rem,28vh,16rem)] h-[clamp(7rem,28vh,16rem)] mx-auto bg-white rounded-2xl sm:rounded-3xl border-4 sm:border-8 border-white shadow-lg flex items-center justify-center overflow-hidden relative my-3 lg:my-5 shrink-0">
        {latestScan.face_reference_path ? (
          <img 
            src={`http://localhost:5106/ReferenceFaces/${latestScan.face_reference_path}?t=${cacheBuster}`} 
            className={`w-full h-full object-cover ${isScanning ? 'opacity-40 grayscale blur-md' : ''}`}
            alt="Student" 
          />
        ) : (
          <ImageOff className="text-slate-300 w-10 h-10 sm:w-14 sm:h-14" />
        )}
        
        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500/10 backdrop-blur-[2px]">
             <ScanLine className="text-blue-600 animate-ping mb-2 w-10 h-10 sm:w-14 sm:h-14" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="text-center mb-3 lg:mb-5 shrink-0 min-w-0">
        <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-slate-900 leading-tight tracking-tight truncate">{latestScan.first_name} {latestScan.last_name}</h3>
        <p className="text-slate-500 font-bold text-sm lg:text-base xl:text-lg mt-1 sm:mt-2 tracking-widest uppercase truncate">{latestScan.student_id}</p>
        {latestScan.hint && (
          <p className="text-amber-600 font-bold text-xs sm:text-sm mt-3 px-3 py-1.5 bg-amber-100 rounded-lg inline-block">{latestScan.hint}</p>
        )}
      </div>
      
      {/* Status Badge */}
      <div className={`p-3 lg:p-4 rounded-xl sm:rounded-2xl font-black text-sm lg:text-base xl:text-lg flex items-center justify-center gap-2 sm:gap-3 w-full text-white shadow-md mt-auto tracking-widest shrink-0 ${isScanning ? 'bg-blue-600 animate-pulse' : (isMissing || isNoProfessor) ? 'bg-amber-500' : isApproved ? 'bg-emerald-600' : 'bg-rose-600'}`}>
        {isScanning ? <ScanLine className="animate-spin w-5 h-5 lg:w-6 lg:h-6 shrink-0" /> : (isMissing || isNoProfessor) ? <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" /> : isApproved ? <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" /> : <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6 shrink-0" />}
        {isScanning ? 'ANALYZING...' : isMissing ? 'NO REGISTERED PHOTO' : isNoProfessor ? 'WAITING FOR PROFESSOR' : isCutting ? 'EARLY EXIT FLAG' : isApproved ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
      </div>
    </div>
  );
}
