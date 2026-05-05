import { UserCircle, Edit2, Trash2, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

export default function StaffTable({ staffList, sortConfig, onSort, onViewProfile, onEdit, onDelete }) {
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />;
  };

  return (
    <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-200">
        <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 cursor-pointer select-none">
            <th className="p-4 w-32 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('user_ID')}><div className="flex items-center gap-1">User ID {renderSortIcon('user_ID')}</div></th>
            <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('last_Name')}><div className="flex items-center gap-1">Last Name {renderSortIcon('last_Name')}</div></th>
            <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('first_Name')}><div className="flex items-center gap-1">First Name {renderSortIcon('first_Name')}</div></th>
            <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => onSort('middle_Name')}><div className="flex items-center gap-1">Middle Name {renderSortIcon('middle_Name')}</div></th>
            <th className="p-4 w-40 hover:bg-slate-100 transition-colors outline-none text-center" onClick={() => onSort('role')}><div className="flex items-center justify-center gap-1">Role {renderSortIcon('role')}</div></th>
            <th className="p-4 w-40 text-center cursor-default outline-none">Action</th>
            </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-100">
            {staffList.map((staff) => (
            <tr key={staff.user_ID} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="p-4 font-bold text-slate-600 font-mono text-sm">{staff.user_ID}</td>
                <td className="p-4 font-black text-slate-800 truncate">{staff.last_Name}</td>
                <td className="p-4 font-bold text-slate-700 truncate">{staff.first_Name}</td>
                <td className="p-4 font-medium text-slate-500 truncate">{staff.middle_Name || '-'}</td>
                <td className="p-4 text-center">
                  <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold border bg-slate-50 text-slate-700 border-slate-200">
                    {staff.role}
                  </span>
                </td>
                <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onViewProfile(staff)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200" title="View Profile">
                      <UserCircle size={18} />
                    </button>
                    <button onClick={() => onEdit(staff)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title="Edit Staff">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => onDelete(staff)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Delete Staff">
                      <Trash2 size={18} />
                    </button>
                </div>
                </td>
            </tr>
            ))}
            {staffList.length === 0 && (
            <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">No matching staff found.</td></tr>
            )}
        </tbody>
        </table>
    </div>
  );
}