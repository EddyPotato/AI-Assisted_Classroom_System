import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Database, Search, LogOut, Camera, Calendar, BookOpen, Plus, Building, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RegistrarPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedules');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [schedules, setSchedules] = useState([]); // LIVE DATABASE STATE
  
  // Custom Modal State for Data Integrity
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  // Form State mapped to C# Schedule Model (NOW DEFAULTING TO BLANK/EMPTY)
  const initialFormState = {
    schedule_ID: '', subject_Code: '', section_ID: '', 
    professor_ID: '', room_ID: '', time_Start: '', 
    time_End: '', class_Days: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  // FETCH LIVE DATA FROM ORACLE
  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://localhost:5106/api/schedules');
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch {
      console.error("Failed to fetch live schedules from Oracle.");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Open a completely clean, blank form for a NEW schedule
  const handleCreateClick = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setShowScheduleForm(true);
  };

  // Pre-fill form when "Edit" is clicked using real database field names
  const handleEditClick = (sched) => {
    setFormData({
      schedule_ID: sched.schedule_ID,
      subject_Code: sched.subject_Code || '',
      section_ID: sched.section_ID || '', 
      professor_ID: sched.professor_ID || '',
      room_ID: sched.room_ID || '',
      time_Start: sched.time_Start || '',
      time_End: sched.time_End || '',
      class_Days: sched.class_Days || ''
    });
    setIsEditing(true);
    setShowScheduleForm(true);
  };

  const requestSave = () => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: isEditing ? 'Confirm Schedule Update' : 'Confirm New Schedule',
      message: isEditing 
        ? 'Are you sure you want to modify this active schedule? This will immediately affect the Professor and Students assigned to it.' 
        : 'Are you sure you want to create this new schedule?',
      onConfirm: executeSave
    });
  };

  const executeSave = async () => {
    setModal({ isOpen: false }); 
    
    try {
      const url = isEditing 
        ? `http://localhost:5106/api/schedules/${formData.schedule_ID}` 
        : 'http://localhost:5106/api/schedules';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setModal({
          isOpen: true,
          type: 'success',
          title: 'Success!',
          message: isEditing ? 'The schedule has been successfully updated in the Oracle Database.' : 'The new schedule has been saved successfully.',
          onConfirm: () => {
            setModal({ isOpen: false });
            setShowScheduleForm(false);
            setIsEditing(false);
            setFormData(initialFormState);
            fetchSchedules(); // BOOM! Refetches the live data instantly!
          }
        });
      } else {
        const errorData = await response.json();
        alert(`Database Error: ${errorData.message}`);
      }
    } catch {
      alert("Error connecting to backend API. Is the C# server running?");
    }
  };

  const handleCancelForm = () => {
    setShowScheduleForm(false);
    setIsEditing(false);
    setFormData(initialFormState);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden relative">
      
      {/* CUSTOM MODAL OVERLAY */}
      {modal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 border-b ${modal.type === 'warning' ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div className="flex items-center gap-3">
                {modal.type === 'warning' ? <AlertTriangle className="text-amber-500" size={28}/> : <CheckCircle className="text-emerald-500" size={28}/>}
                <h3 className="text-xl font-black text-slate-800">{modal.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 font-medium leading-relaxed">{modal.message}</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              {modal.type === 'warning' && (
                <button onClick={() => setModal({ isOpen: false })} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
              )}
              <button 
                onClick={modal.onConfirm} 
                className={`px-6 py-2 font-bold text-white rounded-lg transition-all shadow-md active:scale-95 ${modal.type === 'warning' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {modal.type === 'warning' ? 'Confirm & Save' : 'Okay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRAR HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Registrar Operations</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.First_Name} {user?.Last_Name}</p>
            <p className="text-xs font-bold text-blue-600 uppercase">Campus HR</p>
          </div>
          <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded-lg transition-colors border border-rose-200 hover:border-rose-500 shadow-sm">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex gap-4 border-b border-slate-200 pb-1">
            <button onClick={() => setActiveTab('schedules')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'schedules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <Calendar size={18} /> Master Schedule
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <Users size={18} /> User Directory
            </button>
          </div>

          {activeTab === 'schedules' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Master Schedule</h2>
                  <p className="text-slate-500 mt-1 font-medium text-sm">Create and manage class sections, room assignments, and schedules.</p>
                </div>
                <button onClick={() => showScheduleForm ? handleCancelForm() : handleCreateClick()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
                  {showScheduleForm ? 'Cancel Form' : <><Plus size={18} /> Create Schedule</>}
                </button>
              </div>

              {/* DYNAMIC FORM (CREATE/EDIT) */}
              {showScheduleForm && (
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-lg shadow-blue-100/50 animate-in slide-in-from-top-4">
                  <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    {isEditing ? <Edit2 size={20} className="text-amber-500"/> : <BookOpen size={20} className="text-blue-500" />} 
                    {isEditing ? `Edit Schedule: ${formData.schedule_ID}` : 'New Class Section'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                      <select name="subject_Code" onChange={handleChange} value={formData.subject_Code} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
                        <option value="" disabled>-- Select Subject --</option>
                        <option value="IM101">IM101 - Advance Database Systems</option>
                        <option value="IPT101">IPT101 - Integrative Programming</option>
                        <option value="SE101">SE101 - Software Engineering</option>
                        <option value="HCI101">HCI101 - Human Computer Interaction</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section Block</label>
                      <select name="section_ID" onChange={handleChange} value={formData.section_ID} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
                        <option value="" disabled>-- Select Section --</option>
                        <option value="SEC-001">SBIT2A (SB Campus)</option>
                        <option value="SEC-002">SBIT2B (SB Campus)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Professor</label>
                      <select name="professor_ID" onChange={handleChange} value={formData.professor_ID} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
                        <option value="" disabled>-- Select Professor --</option>
                        <option value="PRO-0001">Joel Olayon</option>
                        <option value="PRO-0002">Darrel Datoon</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Facility / Room</label>
                      <select name="room_ID" onChange={handleChange} value={formData.room_ID} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm">
                        <option value="" disabled>-- Select Room --</option>
                        <option value="IL-602">IL-602 (New Academic Building)</option>
                        <option value="IL-703">IL-703 (New Academic Building)</option>
                        <option value="IK-504">IK-504 (Bautista Building)</option>
                        <option value="IK-604">IK-604 (Bautista Building)</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Start</label>
                        <input type="time" name="time_Start" onChange={handleChange} value={formData.time_Start} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time End</label>
                        <input type="time" name="time_End" onChange={handleChange} value={formData.time_End} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class Days</label>
                      <input type="text" name="class_Days" onChange={handleChange} value={formData.class_Days} placeholder="e.g. Monday, Wednesday" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 shadow-sm" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                     <button onClick={handleCancelForm} className="font-bold py-2 px-4 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                      Cancel
                    </button>
                    <button onClick={requestSave} className={`text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                      {isEditing ? <Edit2 size={16}/> : <Database size={16}/>}
                      {isEditing ? 'Update Schedule' : 'Save to Oracle'}
                    </button>
                  </div>
                </div>
              )}

              {/* LIVE DATABASE TABLE LAYOUT */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b border-slate-200 tracking-wider">
                      <th className="p-5 w-32">Sched ID</th>
                      <th className="p-5">Course Details</th>
                      <th className="p-5 w-48">Professor</th>
                      <th className="p-5 w-48">Time & Days</th>
                      <th className="p-5">Location</th>
                      <th className="p-5 w-24 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((sched) => (
                      <tr key={sched.schedule_ID} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="p-5 font-bold text-slate-500 font-mono text-sm">{sched.schedule_ID}</td>
                        <td className="p-5">
                          <p className="font-black text-slate-800 text-base">{sched.subject_Code} - {sched.subject_Title}</p>
                          <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2.5 py-0.5 rounded border border-blue-100 mt-1.5 shadow-sm">{sched.section_Name}</p>
                        </td>
                        <td className="p-5 font-semibold text-slate-700">
                           <div className="flex items-center gap-2"><Users size={16} className="text-slate-400"/> {sched.professor_Name}</div>
                        </td>
                        <td className="p-5 font-medium text-slate-600">
                           <div className="flex items-center gap-2 mb-1"><Calendar size={14} className="text-slate-400"/> <span className="text-xs font-bold uppercase">{sched.class_Days}</span></div>
                           <div className="text-sm">{sched.time_Start} - {sched.time_End}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2 font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg w-max shadow-sm">
                             <Building size={16} className="text-indigo-400"/> {sched.room_ID} ({sched.building})
                          </div>
                        </td>
                        <td className="p-5 text-center">
                          <button onClick={() => handleEditClick(sched)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200" title="Edit Schedule">
                            <Edit2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {schedules.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-10 text-center text-slate-400 font-bold bg-slate-50">
                           No schedules found. Click "Create Schedule" to assign your first class.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USER DIRECTORY TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Directory</h2>
                  <p className="text-slate-500 mt-1 font-medium">Manage student enrollments and staff access.</p>
                </div>
                <button className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2">
                  <UserPlus size={18} /> Enroll New User
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search ID or Name..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <select className="px-4 py-2 border border-slate-200 rounded-lg outline-none text-slate-600 font-medium bg-white">
                    <option>All Roles</option>
                    <option>Students</option>
                    <option>Faculty</option>
                  </select>
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b border-slate-200">
                      <th className="p-4">ID Number</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4 text-center">Face Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-600 font-mono text-sm">24-1507</td>
                      <td className="p-4 font-bold text-slate-800">Edrian Cortes Rodriguez</td>
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