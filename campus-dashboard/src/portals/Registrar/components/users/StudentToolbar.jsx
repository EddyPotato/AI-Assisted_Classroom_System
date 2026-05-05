import { Search, UserPlus, X } from 'lucide-react';

export default function StudentToolbar({ 
  searchQuery, setSearchQuery, filterStatus, setFilterStatus, onEnroll, viewMode 
}) {
  const filterOptions = ['All', 'Regular', 'Irregular'];

  return (
    <div className="p-5 border-b border-slate-200 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      
      {/* Left side: Search and Pill Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200"
              title="Clear Search"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
        
        {/* THE FIX: Only render these filters if we are in the Active View */}
        {viewMode === 'active' && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            {filterOptions.map(option => (
              <button
                key={option}
                onClick={() => setFilterStatus(option)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filterStatus === option 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option === 'All' ? 'All Statuses' : option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side - Enroll Button */}
      {viewMode === 'active' && (
        <button
          onClick={onEnroll}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
        >
          <UserPlus size={18} /> Enroll New Student
        </button>
      )}
    </div>
  );
}