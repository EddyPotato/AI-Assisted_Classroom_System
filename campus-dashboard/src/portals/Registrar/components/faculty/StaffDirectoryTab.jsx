import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Search, Camera, ArrowUpDown, ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react';
import ConfirmModal from '../../../../components/ui/ConfirmModal';

export default function StaffDirectoryTab() {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'user_ID', direction: 'asc' });

  // Delete Modal State
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  const fetchStaff = useCallback(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/staff') 
      .then(res => res.json())
      .then(data => { if (isMounted && Array.isArray(data)) setStaff(data); })
      .catch(err => console.error("Failed to fetch staff", err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cleanup = fetchStaff();
    return cleanup;
  }, [fetchStaff]);

  const filteredStaff = staff.filter(emp => {
    const fullName = `${emp.first_Name} ${emp.middle_Name} ${emp.last_Name}`.toLowerCase();
    const matchesSearch = emp.user_ID.includes(searchQuery) || fullName.includes(searchQuery.toLowerCase());
    const matchesFilter = filterRole === 'All' || emp.role === filterRole; 
    return matchesSearch && matchesFilter;
  });

  const sortedStaff = [...filteredStaff].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="text-primary-500" /> : <ChevronDown size={14} className="text-primary-500" />;
  };

  // DELETE HANDLERS
  const handleDeleteClick = (emp) => {
    setModal({
      isOpen: true,
      type: 'danger',
      title: 'Remove Staff Member',
      message: `Are you sure you want to remove ${emp.first_Name} ${emp.last_Name} (${emp.user_ID})? Their system access will be revoked permanently.`,
      onConfirm: () => executeDelete(emp.user_ID)
    });
  };

  const executeDelete = async (id) => {
    setModal({ ...modal, isOpen: false });
    try {
      const res = await fetch(`http://localhost:5106/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff(); 
      } else {
        alert("Failed to delete staff member.");
      }
    } catch {
      alert("Network error.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <ConfirmModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal({ ...modal, isOpen: false })} />

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Staff Directory</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Manage campus employees, roles, and system access.</p>
        </div>
        <button onClick={() => alert('Add Staff Modal coming next!')} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95">
          <UserPlus size={18} /> Register Staff
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID or Name..." className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="px-4 py-2 border border-slate-300 rounded-lg outline-none text-slate-700 font-bold bg-white">
            <option value="All">All Roles</option>
            <option value="Faculty">Faculty</option>
            <option value="Registrar">Registrar (HR)</option>
            <option value="Guard">Guard</option>
          </select>
        </div>
        
        <table className="w-full text-left table-fixed border-collapse">
          <thead>
            <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b-2 border-slate-200 cursor-pointer select-none">
              <th className="p-4 w-32 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('user_ID')}>
                <div className="flex items-center gap-1">User ID {renderSortIcon('user_ID')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('first_Name')}>
                <div className="flex items-center gap-1">First Name {renderSortIcon('first_Name')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('middle_Name')}>
                <div className="flex items-center gap-1">Middle Name {renderSortIcon('middle_Name')}</div>
              </th>
              <th className="p-4 hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('last_Name')}>
                <div className="flex items-center gap-1">Last Name {renderSortIcon('last_Name')}</div>
              </th>
              <th className="p-4 w-32 text-center hover:bg-slate-100 transition-colors outline-none" onClick={() => handleSort('role')}>
                 <div className="flex items-center justify-center gap-1">Role {renderSortIcon('role')}</div>
              </th>
              <th className="p-4 w-28 text-center cursor-default outline-none">Face</th>
              
              <th className="p-4 w-32 text-center cursor-default outline-none">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {sortedStaff.map((emp) => (
              <tr key={emp.user_ID} className="hover:bg-primary-50/40 transition-colors group">
                <td className="p-4 font-bold text-slate-600 font-mono text-sm">{emp.user_ID}</td>
                <td className="p-4 font-bold text-slate-800 truncate">{emp.first_Name}</td>
                <td className="p-4 font-medium text-slate-600 truncate">{emp.middle_Name || '-'}</td>
                <td className="p-4 font-bold text-slate-800 truncate">{emp.last_Name}</td>
                <td className="p-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border 
                    ${emp.role === 'Faculty' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                      emp.role === 'Guard' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {emp.role}
                  </span>
                </td>
                <td className="p-4 flex justify-center items-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border-2 border-slate-200">
                    <Camera size={16}/>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title="Edit Employee">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteClick(emp)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Remove Employee">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {sortedStaff.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-bold bg-slate-50/50">No matching staff found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}