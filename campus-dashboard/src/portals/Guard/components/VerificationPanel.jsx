import { ShieldCheck, XCircle, AlertTriangle, User, Clock } from 'lucide-react';

export default function VerificationPanel({ latestScan, cacheBuster }) {
  if (!latestScan) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
        <User size={64} className="text-slate-200 mb-4" />
        <h3 className="text-xl font-black text-slate-400">Awaiting Subject</h3>
        <p className="text-slate-400 font-medium mt-2">Camera stream is active. Waiting for face detection...</p>
      </div>
    );
  }

  // Determine styles and icons based on the STRICT state machine statuses
  const isApproved = latestScan.status === 'approved';
  const isCutting = latestScan.status === 'Cutting / Early Exit';
  const isDuplicate = latestScan.status === 'duplicate';
  
  const panelStyle = isApproved 
    ? "bg-emerald-50 border-emerald-500 shadow-emerald-100" 
    : isCutting || isDuplicate
      ? "bg-amber-50 border-amber-500 shadow-amber-100"
      : "bg-rose-50 border-rose-500 shadow-rose-100";

  const Icon = isApproved ? ShieldCheck : isCutting || isDuplicate ? AlertTriangle : XCircle;
  const iconColor = isApproved ? "text-emerald-600" : isCutting || isDuplicate ? "text-amber-600" : "text-rose-600";

  return (
    <div className={`w-full h-full flex flex-col bg-white rounded-3xl border-2 ${panelStyle} shadow-lg overflow-hidden transition-all duration-300 animate-in slide-in-from-right-4`}>
      
      <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Dynamic Icon */}
        <div className="mb-6">
          <Icon size={72} className={iconColor} strokeWidth={2} />
        </div>

        {/* Student Identity */}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          {latestScan.first_name} <span className="text-slate-500">{latestScan.last_name}</span>
        </h2>
        <div className="font-mono font-bold text-slate-400 text-lg mt-2 mb-6 tracking-widest">
          {latestScan.student_id}
        </div>

        {/* The Natural Text Message from the Backend */}
        <div className={`px-6 py-4 rounded-2xl w-full font-black text-lg sm:text-xl leading-relaxed ${
          isApproved ? 'bg-emerald-100 text-emerald-800' : 
          isCutting || isDuplicate ? 'bg-amber-100 text-amber-800' : 
          'bg-rose-100 text-rose-800'
        }`}>
          {latestScan.message || (isApproved ? "ACCESS GRANTED" : "ACCESS DENIED")}
        </div>

        {/* Timestamp & Metadata */}
        <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-400 bg-white/50 px-4 py-2 rounded-xl border border-slate-200">
          <Clock size={16} />
          <span>Scanned at {latestScan.timestamp}</span>
        </div>

      </div>
    </div>
  );
}