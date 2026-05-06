import { Database } from 'lucide-react';

export default function LoginHeader() {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 mb-6 border border-primary-100 shadow-sm">
        <Database size={32} />
      </div>
      <h1 className="text-3xl font-black text-slate-800 tracking-tight">QCU Portal</h1>
      <p className="text-slate-500 font-medium mt-2">Sign in to your campus account</p>
    </div>
  );
}