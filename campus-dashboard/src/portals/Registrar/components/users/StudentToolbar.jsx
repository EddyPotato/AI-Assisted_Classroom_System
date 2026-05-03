import { Search } from 'lucide-react';

export default function StudentToolbar({ searchQuery, setSearchQuery, filterStatus, setFilterStatus }) {
  return (
    <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50/50">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          placeholder="Search ID or Name..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" 
        />
      </div>
      <select 
        value={filterStatus} 
        onChange={(e) => setFilterStatus(e.target.value)} 
        className="px-4 py-2 border border-slate-300 rounded-lg outline-none text-slate-700 font-bold bg-white"
      >
        <option value="All">All Statuses</option>
        <option value="Regular">Regular Students</option>
        <option value="Irregular">Irregular Students</option>
      </select>
    </div>
  );
}