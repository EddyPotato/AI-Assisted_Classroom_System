// We no longer need to import 'School' from lucide-react!
import qcuLogo from '../../assets/qcu-logo.svg'; 

export default function LoginHeader() {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white mb-6 border border-slate-100 shadow-sm overflow-hidden p-2">
        
        {/* The real logo is now the only thing inside this box */}
        <img src={qcuLogo} alt="Quezon City University Logo" className="w-full h-full object-contain" />
        
      </div>
      
      <h1 className="text-3xl font-black text-slate-800 tracking-tight">QCU Faculty & Staff</h1>
      <p className="text-slate-500 font-medium mt-2">Sign in to the unified campus portal</p>
    </div>
  );
}