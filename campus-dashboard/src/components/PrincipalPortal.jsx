import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, AlertTriangle, LogOut, Building, ShieldCheck } from 'lucide-react';

export default function PrincipalPortal() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  
  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/rooms');
        if (response.ok) {
          const data = await response.json();
          setRooms(data);
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-indigo-600" size={24} />
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Executive Command Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">{user?.First_Name} {user?.Last_Name}</p>
            <p className="text-xs font-bold text-indigo-600 uppercase">Principal / Admin</p>
          </div>
          <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded-lg transition-colors border border-rose-200 hover:border-rose-500 shadow-sm">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Campus Overview</h2>
            <p className="text-gray-500 mt-1 font-medium">Real-time macro analytics and facility security status.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Population</p>
                <Users size={16} className="text-indigo-500" />
              </div>
              <p className="text-3xl font-black text-gray-800">1,248</p>
              <p className="text-xs font-bold text-emerald-500 mt-1">+12% from yesterday</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Active Facilities</p>
                <Building size={16} className="text-blue-500" />
              </div>
              <p className="text-3xl font-black text-gray-800">0 <span className="text-lg text-gray-400">/ 4</span></p>
              <p className="text-xs font-bold text-gray-400 mt-1">All rooms inactive</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Security Status</p>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-600">SECURE</p>
              <p className="text-xs font-bold text-emerald-500 mt-1">All edge nodes active</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-black text-rose-400 uppercase tracking-wider">Active Alerts</p>
                <AlertTriangle size={16} className="text-rose-500" />
              </div>
              <p className="text-3xl font-black text-rose-600">0</p>
              <p className="text-xs font-bold text-rose-500 mt-1">No unauthorized exits</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <h3 className="text-lg font-black text-gray-800">Live Facility Tracking</h3>
               <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> LIVE DB
               </span>
            </div>
            
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-black border-b border-gray-200">
                  <th className="p-4">Room ID</th>
                  <th className="p-4">Building</th>
                  <th className="p-4">Floor</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rooms.map((room) => (
                  <tr key={room.room_ID} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-black text-gray-800">{room.room_ID}</td>
                    <td className="p-4 font-bold text-gray-600">{room.building}</td>
                    <td className="p-4 font-bold text-indigo-600">Floor {room.floor}</td>
                    <td className="p-4 font-medium text-gray-600">{room.room_Type}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                        room.status === 'In Session' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400 font-medium">Fetching facilities from Oracle Database...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}