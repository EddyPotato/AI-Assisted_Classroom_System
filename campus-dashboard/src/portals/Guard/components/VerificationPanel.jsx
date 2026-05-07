import { ImageOff, ScanLine, AlertCircle, CheckCircle2, BadgeCheck, CalendarX } from 'lucide-react';

export default function VerificationPanel({ latestScan, cacheBuster }) {
  if (!latestScan) {
    return (
      <div className="w-full max-w-xl h-full mx-auto bg-white border border-slate-200 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-center text-slate-400 flex flex-col items-center justify-center shadow-sm min-h-[400px]">
        <ScanLine className="mb-5 sm:mb-6 opacity-30 w-14 h-14 lg:w-20 lg:h-20" />
        <p className="font-black text-2xl sm:text-3xl text-slate-500 tracking-tight">System Ready</p>
        <p className="text-base sm:text-lg mt-2 font-medium text-slate-400">Awaiting biometric scan...</p>
      </div>
    );
  }

  const isScanning = latestScan.status === 'scanning';
  const isMissing = latestScan.status === 'missing_face';
  const isApproved = latestScan.status === 'approved' || latestScan.status === 'Access Granted';
  const isNoProfessor = latestScan.status === 'no_professor_yet';
  const isCutting = latestScan.status === 'cutting';
  const isInvalidSchedule = latestScan.status === 'invalid_schedule'; // NEW: Early Rejection

  return (
    <div className={`w-full max-w-xl h-full mx-auto border rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 shadow-sm transition-all duration-300 flex flex-col justify-center overflow-y-auto min-h-[450px] ${isScanning ? 'bg-blue-50 border-blue-300 ring-4 ring-blue-500/20' : isMissing ? 'bg-amber-50 border-amber-300 ring-4 ring-amber-500/20' : isNoProfessor ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-500/30' : isApproved ? 'bg-emerald-50 border-emerald-300 ring-4 ring-emerald-500/20' : 'bg-rose-50 border-rose-300 ring-4 ring-rose-500/20'}`}>
      
      <h2 className="text-xs sm:text-sm font-black text-slate-500 uppercase tracking-widest text-center shrink-0">
         {isScanning ? 'Analyzing Biometrics...' : isMissing ? 'Error: Missing Data' : isNoProfessor ? 'Attendance Paused' : isInvalidSchedule ? 'Schedule Error' : 'Verification Result'}
      </h2>
      
      {/* EARLY REJECTION UI (Skips face and just shows error) */}
      {isInvalidSchedule ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
           <div className="w-24 h-24 sm:w-32 sm:h-32 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6">
             <CalendarX size={64} strokeWidth={2} />
           </div>
           <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-2">No Schedule Found</h3>
           <p className="text-rose-600 font-bold text-lg px-6">{latestScan.hint || "You are not scheduled for this room right now."}</p>
        </div>
      ) : (
        <>
          {/* Square Profile Picture Area (Flexes to fit) */}
          <div className="w-full max-w-[14rem] sm:max-w-[16rem] lg:max-w-[20rem] aspect-square mx-auto bg-white rounded-2xl sm:rounded-3xl border-8 border-white shadow-md flex items-center justify-center overflow-hidden relative my-4 sm:my-6 shrink-0">
            {latestScan.face_reference_path ? (
              <img 
                src={`http://localhost:5106/ReferenceFaces/${latestScan.face_reference_path}?t=${cacheBuster}`} 
                className="w-full h-full object-contain bg-slate-100"
                alt="Reference" 
              />
            ) : (
              <ImageOff className="text-slate-300 w-16 h-16 sm:w-24 sm:h-24" />
            )}
            
            {isScanning && latestScan.face_reference_path && (
              <div className="absolute inset-0 pointer-events-none">
                 <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-[scan_1.5s_ease-in-out_infinite_alternate] absolute top-0 left-0"></div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="text-center mb-4 lg:mb-6 shrink-0 flex flex-col items-center justify-center">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-none tracking-tighter w-full pb-2" style={{ wordBreak: 'break-word' }}>
              {latestScan.first_name} {latestScan.last_name}
            </h3>
            
            <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1 sm:mt-2 bg-slate-100/70 px-4 py-2 rounded-xl border border-slate-200">
              <BadgeCheck className="text-blue-500 w-6 h-6 lg:w-8 lg:h-8 shrink-0" />
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-700 font-mono tracking-wider truncate">
                {latestScan.student_id}
              </p>
            </div>

            {latestScan.hint && !isInvalidSchedule && (
              <p className="text-amber-700 font-black text-sm sm:text-base mt-4 px-4 py-2 bg-amber-100 border border-amber-200 rounded-xl inline-block w-full">
                {latestScan.hint}
              </p>
            )}
          </div>
        </>
      )}
      
      {/* Friendly Status Badge */}
      <div className={`p-4 lg:p-5 rounded-2xl font-black text-base lg:text-xl flex items-center justify-center gap-3 w-full text-white shadow-lg mt-auto tracking-widest shrink-0 ${isScanning ? 'bg-blue-600 shadow-blue-500/30' : (isMissing || isNoProfessor) ? 'bg-amber-500 shadow-amber-500/30' : isApproved ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-600 shadow-rose-500/30'}`}>
        {isScanning ? <ScanLine className="animate-spin w-6 h-6 lg:w-8 lg:h-8 shrink-0" /> : (isMissing || isNoProfessor) ? <AlertCircle className="w-6 h-6 lg:w-8 lg:h-8 shrink-0" /> : isApproved ? <CheckCircle2 className="w-6 h-6 lg:w-8 lg:h-8 shrink-0" /> : <AlertCircle className="w-6 h-6 lg:w-8 lg:h-8 shrink-0" />}
        {isScanning ? 'ANALYZING...' : isMissing ? 'NO REGISTERED PHOTO' : isNoProfessor ? 'WAITING FOR PROFESSOR' : isInvalidSchedule ? 'INVALID SCHEDULE' : isCutting ? 'EARLY EXIT FLAG' : isApproved ? 'ATTENDANCE RECORDED' : 'ENTRY DENIED'}
      </div>

      <style dangerouslySetInnerHTML={{__html: `@keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }`}} />
    </div>
  );
}