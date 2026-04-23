import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Database, Search, LogOut, Camera, Calendar, BookOpen, Plus, Building } from 'lucide-react';

export default function RegistrarPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedules'); // 'users' or 'schedules'
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // Form State mapped to C# Schedule Model
  const [formData, setFormData] = useState({
    subject_Code: 'IM101', 
    section_ID: 'SEC-001', 
    professor_ID: 'PRO-0001', 
    room_ID: 'IL-602', 
    time_Start: '08:00', 
    time_End: '11:00', 
    class_Days: 'Monday, Wednesday'
  });

  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  // Handle Form Input Changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle Form Submission to Oracle Database
  const handleSaveSchedule = async () => {
    try {
      const response = await fetch('http://localhost:5106/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert("Schedule Saved to Oracle Database successfully!");
        setShowScheduleForm(false);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch { // Removed the unused 'error' parameter to fix ESLint warning
      alert("Error connecting to backend API. Is the C# server running?");
    }
  };

  // Mock data representing the Schedule GET endpoint for the UI Table
  const mockSchedules = [
    { id: 'SCH-001', subject: 'IM101', section: 'SBIT2A', prof: 'Joel Olayon', room: 'IL-602', time: '08:00 AM - 11:00 AM', days: 'Mon, Wed' },
    { id: 'SCH-002', subject: 'IPT101', section: 'SBIT2B', prof: 'Darrel Datoon', room: 'IK-504', time: '01:00 PM - 04:00 PM', days: 'Tue, Thu' },
  ];

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
          <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded-lg transition-colors border border-rose-200 hover:border-rose-500 shadow-sm">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* TAB NAVIGATION */}
          <div className="flex gap-4 border-b border-gray-200 pb-1">
            <button 
              onClick={() => setActiveTab('schedules')}
              className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'schedules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <Calendar size={18} /> Master Schedule
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              <Users size={18} /> User Directory
            </button>
          </div>

          {/* =========================================
              TAB 1: MASTER SCHEDULE MANAGEMENT 
              ========================================= */}
          {activeTab === 'schedules' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tight">Master Schedule</h2>
                  <p className="text-gray-500 mt-1 font-medium">Create and manage class sections, room assignments, and schedules.</p>
                </div>
                <button 
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {showScheduleForm ? 'Cancel Creation' : <><Plus size={18} /> Create Schedule</>}
                </button>
              </div>

              {/* SCHEDULE CREATION FORM */}
              {showScheduleForm && (
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-lg shadow-blue-100/50">
                  <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <BookOpen size={20} className="text-blue-500" /> New Class Section
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                      <select name="subject_Code" onChange={handleChange} value={formData.subject_Code} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700">
                        <option value="IM101">IM101 - Advance Database Systems</option>
                        <option value="IPT101">IPT101 - Integrative Programming</option>
                        <option value="SE101">SE101 - Software Engineering</option>
                        <option value="HCI101">HCI101 - Human Computer Interaction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Section Block</label>
                      <select name="section_ID" onChange={handleChange} value={formData.section_ID} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700">
                        <option value="SEC-001">SBIT2A (SB Campus)</option>
                        <option value="SEC-002">SBIT2B (SB Campus)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Professor</label>
                      <select name="professor_ID" onChange={handleChange} value={formData.professor_ID} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700">
                        <option value="PRO-0001">Joel Olayon</option>
                        <option value="PRO-0002">Darrel Datoon</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Facility / Room</label>
                      <select name="room_ID" onChange={handleChange} value={formData.room_ID} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700">
                        <option value="IL-602">IL-602 (New Academic Building)</option>
                        <option value="IL-703">IL-703 (New Academic Building)</option>
                        <option value="IK-504">IK-504 (Bautista Building)</option>
                        <option value="IK-604">IK-604 (Bautista Building)</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time Start</label>
                        <input type="time" name="time_Start" onChange={handleChange} value={formData.time_Start} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time End</label>
                        <input type="time" name="time_End" onChange={handleChange} value={formData.time_End} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Class Days</label>
                      <input type="text" name="class_Days" onChange={handleChange} value={formData.class_Days} placeholder="e.g. Monday, Wednesday" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700" />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end">
                    <button onClick={handleSaveSchedule} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all">
                      Save Schedule to Database
                    </button>
                  </div>
                </div>
              )}

              {/* SCHEDULE TABLE */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-black border-b border-gray-200">
                      <th className="p-4">Schedule ID</th>
                      <th className="p-4">Subject & Section</th>
                      <th className="p-4">Professor</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Time & Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockSchedules.map((sched) => (
                      <tr key={sched.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-600 font-mono text-sm">{sched.id}</td>
                        <td className="p-4">
                          <p className="font-black text-gray-800">{sched.subject}</p>
                          <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded border border-blue-100 mt-1">{sched.section}</p>
                        </td>
                        <td className="p-4 font-semibold text-gray-700 flex items-center gap-2 mt-2">
                           <Users size={14} className="text-gray-400"/> {sched.prof}
                        </td>
                        <td className="p-4 font-bold text-indigo-600 flex items-center gap-2 mt-2">
                           <Building size={14} className="text-indigo-400"/> {sched.room}
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-600">
                           <span className="block">{sched.time}</span>
                           <span className="text-xs text-gray-400 font-bold">{sched.days}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 2: USER DIRECTORY
              ========================================= */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-gray-800 tracking-tight">User Directory</h2>
                  <p className="text-gray-500 mt-1 font-medium">Manage student enrollments and staff access.</p>
                </div>
                <button className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-600 font-mono text-sm">24-1507</td>
                      <td className="p-4 font-bold text-gray-800">Edrian Cortes Rodriguez</td>
                      <td className="p-4"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">Student</span></td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100"><Camera size={12}/> Enrolled</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}