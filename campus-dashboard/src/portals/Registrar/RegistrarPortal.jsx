import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Database, Search, LogOut, Camera, Calendar, Plus, X } from 'lucide-react';

import ConfirmModal from '../../components/ui/ConfirmModal';
import ScheduleForm from './components/ScheduleForm';
import MasterScheduleTable from './components/MasterScheduleTable';
import StudentEnrollmentModal from './components/StudentEnrollmentModal';

const getSchedulesData = async () => {
  try {
    const response = await fetch('http://localhost:5106/api/schedules');
    return response.ok ? await response.json() : [];
  } catch {
    return [];
  }
};

export default function RegistrarPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedules');
  
  // Schedule State
  const [schedules, setSchedules] = useState([]); 
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = { 
    schedule_ID: '', subject_Code: '', section_ID: '', 
    professor_ID: '', room_ID: '', time_Start: '', 
    time_End: '', class_Days: '' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // Student Directory & Search State
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Global Modal State
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  // --- DATA FETCHING ---
  const fetchSchedules = useCallback(() => {
    let isMounted = true;
    getSchedulesData().then(data => { if (isMounted) setSchedules(data); });
    return () => { isMounted = false; };
  }, []);

  const fetchStudents = useCallback(() => {
    let isMounted = true;
    fetch('http://localhost:5106/api/student')
      .then(res => res.json())
      .then(data => { if (isMounted && Array.isArray(data)) setStudents(data); })
      .catch(err => console.error("Failed to fetch students", err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const cleanupSchedules = fetchSchedules();
    const cleanupStudents = fetchStudents();
    return () => { cleanupSchedules(); cleanupStudents(); };
  }, [fetchSchedules, fetchStudents]);

  // --- HANDLERS ---
  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    navigate('/login', { replace: true });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateClick = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setShowScheduleForm(true);
  };

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

  const handleCancelForm = () => {
    setShowScheduleForm(false);
    setIsEditing(false);
    setFormData(initialFormState);
  };

  const requestSave = () => {
    setModal({
      isOpen: true,
      type: 'warning',
      title: isEditing ? 'Confirm Schedule Update' : 'Confirm New Schedule',
      message: isEditing 
        ? 'Are you sure you want to modify this active schedule?' 
        : 'Are you sure you want to create this new schedule?',
      onConfirm: executeSave
    });
  };

  const executeSave = async () => {
    setModal({ isOpen: false }); 
    try {
      const url = isEditing ? `http://localhost:5106/api/schedules/${formData.schedule_ID}` : 'http://localhost:5106/api/schedules';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setModal({
          isOpen: true, type: 'success', title: 'Success!',
          message: isEditing ? 'Schedule updated.' : 'New schedule saved.',
          onConfirm: () => {
            setModal({ isOpen: false });
            setShowScheduleForm(false);
            setIsEditing(false);
            setFormData(initialFormState);
            fetchSchedules(); 
          }
        });
      } else {
        const errorData = await response.json();
        alert(`Database Error: ${errorData.message}`);
      }
    } catch {
      alert("Error connecting to backend API.");
    }
  };

  // --- SEARCH FILTER ---
  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_Name} ${student.last_Name}`.toLowerCase();
    const matchesSearch = student.student_ID.includes(searchQuery) || fullName.includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || student.enrollment_Status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden relative">
      
      <ConfirmModal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} onCancel={() => setModal({ ...modal, isOpen: false })} />
      <StudentEnrollmentModal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} onSuccess={fetchStudents} />

      {/* IMAGE ZOOM MODAL */}
      {zoomedImage && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in" onClick={() => setZoomedImage(null)}>
          <div className="relative">
             <button onClick={() => setZoomedImage(null)} className="absolute -top-4 -right-4 bg-white text-slate-800 p-2 rounded-full shadow-lg hover:bg-rose-500 hover:text-white transition-colors">
               <X size={20} />
             </button>
             <img src={zoomedImage} alt="Face Reference" className="rounded-2xl shadow-2xl max-w-xl max-h-[80vh] border-4 border-white object-cover" />
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Registrar Operations</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.First_Name || user?.first_Name || 'Admin'} {user?.Last_Name || user?.last_Name || ''}</p>
            <p className="text-xs font-bold text-blue-600 uppercase">Campus HR</p>
          </div>
          <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded-lg transition-colors border border-rose-200 hover:border-rose-500 shadow-sm"><LogOut size={20} /></button>
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

          {/* SCHEDULES TAB */}
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

              {/* RESTORED: Schedule Form Component */}
              {showScheduleForm && (
                <ScheduleForm 
                  formData={formData}
                  isEditing={isEditing}
                  handleChange={handleChange}
                  handleCancelForm={handleCancelForm}
                  requestSave={requestSave}
                />
              )}

              {/* RESTORED: Master Schedule Table Component */}
              <MasterScheduleTable 
                schedules={schedules}
                handleEditClick={handleEditClick}
              />
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Directory</h2>
                  <p className="text-slate-500 mt-1 font-medium">Manage student enrollments and face data references.</p>
                </div>
                <button onClick={() => setShowEnrollModal(true)} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95">
                  <UserPlus size={18} /> Enroll New User
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search ID or Name..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg outline-none text-slate-600 font-bold bg-white">
                    <option value="All">All Statuses</option>
                    <option value="Regular">Regular Students</option>
                    <option value="Irregular">Irregular Students</option>
                  </select>
                </div>
                
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase text-slate-500 font-black border-b border-slate-200">
                      <th className="p-4 w-24">Face</th>
                      <th className="p-4">ID Number</th>
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Enrollment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.student_ID} className="hover:bg-blue-50/50 transition-colors">
                        <td className="p-4">
                          {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                            <img 
                               src={`http://localhost:5106/faces/${student.face_Reference_Path}`} 
                               alt="Face" 
                               onClick={() => setZoomedImage(`http://localhost:5106/faces/${student.face_Reference_Path}`)}
                               className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                              <Camera size={16}/>
                            </div>
                          )}
                        </td>
                        <td className="p-4 font-bold text-slate-600 font-mono text-sm">{student.student_ID}</td>
                        <td className="p-4 font-bold text-slate-800">
                          {student.first_Name} {student.middle_Name} {student.last_Name}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${student.enrollment_Status === 'Regular' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                            {student.enrollment_Status || 'Regular'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan="4" className="p-6 text-center text-slate-400 font-bold bg-slate-50">No matching students found.</td></tr>
                    )}
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