import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Database, Search, LogOut, Camera } from 'lucide-react';

export default function RegistrarPortal() {
  const navigate = useNavigate();
  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      
      {/* REGISTRAR HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Registrar Operations</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">{user?.First_Name} {user?.Last_Name}</p>
            <p className="text-xs font-bold text-blue-600 uppercase">Campus HR</p>
          </div>
          <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded-lg transition-colors border border-rose-200 hover:border-rose-500">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">User Directory</h2>
              <p className="text-gray-500 mt-1 font-medium">Manage student and faculty enrollments.</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
              <UserPlus size={18} /> Enroll New User
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search ID or Name..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <select className="px-4 py-2 border border-gray-200 rounded-lg outline-none text-gray-600 font-medium bg-white">
                <option>All Roles</option>
                <option>Students</option>
                <option>Faculty</option>
              </select>
            </div>
            
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-black border-b border-gray-200">
                  <th className="p-4">ID Number</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Face Data</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Dummy Row for UI Layout */}
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-600 font-mono text-sm">24-1507</td>
                  <td className="p-4 font-bold text-gray-800">Edrian Cortes Rodriguez</td>
                  <td className="p-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">Student</span></td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100"><Camera size={12}/> Enrolled</span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 font-bold text-sm hover:underline">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}