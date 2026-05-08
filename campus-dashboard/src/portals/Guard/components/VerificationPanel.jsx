import { ShieldCheck, XCircle, AlertTriangle, User, Clock, Camera, ImageOff } from 'lucide-react';

export default function VerificationPanel({ latestScan, cacheBuster }) {
  if (!latestScan) {
    return (
      <div className="w-full h-full min-h-75 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
        <User size={64} className="text-slate-200 mb-4" />
        <h3 className="text-xl font-black text-slate-400">Awaiting Subject</h3>
        <p className="text-slate-400 font-medium mt-2">Camera stream is active. Waiting for barcode scan...</p>
      </div>
    );
  }

  // ==========================================
  // 1. STRICT STATE MACHINE LOGIC
  // ==========================================
  const status = latestScan.status;

  // Phase 1 (In Progress / Early Rejection) States
  const isScanning = status === 'scanning';
  const isMissingFace = status === 'missing_face';
  const isInvalidSchedule = status === 'invalid_schedule';

  // Phase 2 (Completed) States
  const isApproved = status === 'approved';
  const isCutting = status === 'Cutting / Early Exit' || status === 'cutting';
  const isDuplicate = status === 'duplicate';

  // ==========================================
  // 2. DYNAMIC STYLING BASED ON STATE
  // ==========================================
  let panelStyle = "bg-rose-50 border-rose-500 shadow-rose-100"; // Defaults to Denied
  let Icon = XCircle;
  let iconColor = "text-rose-600";
  let statusMessage = latestScan.message || latestScan.hint || "ENTRY DENIED";
  let messageStyle = "bg-rose-100 text-rose-800";

  if (isScanning) {
    // The "Waiting for Face" State - Turns Blue!
    panelStyle = "bg-blue-50 border-blue-500 shadow-blue-100";
    Icon = Camera;
    iconColor = "text-blue-600 animate-pulse"; 
    statusMessage = "Barcode Scanned. Verifying Face...";
    messageStyle = "bg-blue-100 text-blue-800";
  } 
  else if (isMissingFace) {
    // The "No Database Image" State
    panelStyle = "bg-amber-50 border-amber-500 shadow-amber-100";
    Icon = ImageOff;
    iconColor = "text-amber-600";
    statusMessage = "No Face Reference in Database. Cannot Verify.";
    messageStyle = "bg-amber-100 text-amber-800";
  } 
  else if (isApproved) {
    // The "Success" State
    panelStyle = "bg-emerald-50 border-emerald-500 shadow-emerald-100";
    Icon = ShieldCheck;
    iconColor = "text-emerald-600";
    messageStyle = "bg-emerald-100 text-emerald-800";
  } 
  else if (isCutting || isDuplicate) {
    // The "Warning" State (Already scanned, or trying to cut class)
    panelStyle = "bg-amber-50 border-amber-500 shadow-amber-100";
    Icon = AlertTriangle;
    iconColor = "text-amber-600";
    messageStyle = "bg-amber-100 text-amber-800";
  }

  // ==========================================
  // 3. SMART PROFILE PICTURE EXTRACTOR
  // ==========================================
  const getCleanFilename = (path) => {
    if (!path) return null;
    
    // 1. Strip away any accidental folder paths (e.g., "C:\...\image")
    let filename = path.split('\\').pop().split('/').pop();
    
    // 2. THE FIX: If the database string (e.g., 'canon_26-0004_face') 
    // does not have a valid image extension, we explicitly append '.jpg'
    const lowerName = filename.toLowerCase();
    if (!lowerName.endsWith('.jpg') && !lowerName.endsWith('.jpeg') && !lowerName.endsWith('.png')) {
      filename += '.jpg';
    }
    
    return filename;
  };

  const cleanFacePath = getCleanFilename(latestScan.face_reference_path);
  const profilePicUrl = cleanFacePath
    ? `http://localhost:5106/ReferenceFaces/${cleanFacePath}?cb=${cacheBuster}`
    : null;

  // Only show timestamp if we are strictly out of Phase 1
  const showTimestamp = latestScan.timestamp && !isScanning && !isMissingFace && !isInvalidSchedule;

  return (
    <div className={`w-full h-full flex flex-col rounded-3xl border-2 ${panelStyle} shadow-lg overflow-hidden transition-all duration-300 animate-in slide-in-from-right-4`}>
      
      <div className="p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* PROFILE PICTURE WITH FLOATING STATUS ICON */}
        <div className="relative mb-6">
          {profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt={`${latestScan.first_name} ${latestScan.last_name}`}
              className={`w-36 h-36 rounded-full object-cover border-4 shadow-md bg-white ${
                isScanning ? 'border-blue-500' :
                isApproved ? 'border-emerald-500' :
                isCutting || isDuplicate || isMissingFace ? 'border-amber-500' :
                'border-rose-500'
              }`}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loops
                e.target.src = "https://via.placeholder.com/150?text=Image+Error"; 
              }}
            />
          ) : (
            // Fallback Avatar if no picture is available
            <div className={`w-36 h-36 rounded-full flex items-center justify-center border-4 shadow-md bg-white ${
                isScanning ? 'border-blue-500' :
                isApproved ? 'border-emerald-500' :
                isCutting || isDuplicate || isMissingFace ? 'border-amber-500' :
                'border-rose-500'
            }`}>
                <User size={64} className="text-slate-300" />
            </div>
          )}

          {/* Floating Action Badge overlayed on the picture */}
          <div className={`absolute -bottom-2 -right-2 p-2.5 rounded-full bg-white shadow-lg border-2 ${
              isScanning ? 'border-blue-500' :
              isApproved ? 'border-emerald-500' :
              isCutting || isDuplicate || isMissingFace ? 'border-amber-500' :
              'border-rose-500'
          }`}>
             <Icon size={28} className={iconColor} strokeWidth={2.5} />
          </div>
        </div>

        {/* STUDENT IDENTITY */}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-none mt-2">
          {latestScan.first_name} <span className="text-slate-500">{latestScan.last_name}</span>
        </h2>
        <div className="font-mono font-bold text-slate-400 text-lg mt-3 mb-6 tracking-widest bg-white/50 px-4 py-1 rounded-lg">
          {latestScan.student_id}
        </div>

        {/* NATURAL TEXT MESSAGE FROM BACKEND */}
        <div className={`px-6 py-4 rounded-2xl w-full font-black text-lg sm:text-xl leading-relaxed shadow-sm ${messageStyle}`}>
          {statusMessage}
        </div>

        {/* CONDITIONAL TIMESTAMP (Strictly hidden during Barcode scanning) */}
        {showTimestamp && (
          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-500 bg-white/60 px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-300">
            <Clock size={18} />
            <span>Scanned at {latestScan.timestamp}</span>
          </div>
        )}

      </div>
    </div>
  );
}