import { useState } from 'react';
import { Search, Keyboard } from 'lucide-react';

export default function ManualIDInput({ onSubmit, isLoading }) {
  const [studentId, setStudentId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (studentId.trim()) {
      onSubmit(studentId.trim());
      setStudentId('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm shrink-0">
      <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <Keyboard size={14} /> Manual ID Entry (Fallback)
      </h2>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Enter Student ID (e.g. 24-1507)"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!studentId.trim() || isLoading}
          className="bg-slate-800 hover:bg-slate-900 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Search size={18} /> Verify
        </button>
      </div>
    </form>
  );
}