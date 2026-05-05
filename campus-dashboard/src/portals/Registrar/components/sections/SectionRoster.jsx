import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, UserMinus, UserPlus, BookOpen, Users, Camera, Clock, MapPin, UserCircle, CalendarPlus, Edit2, Trash2 } from 'lucide-react';
import AddStudentsModal from './AddStudentsModal';
import ConfirmModal from '../../../../components/ui/ConfirmModal';
import ScheduleForm from '../schedules/ScheduleForm';
import FaceZoomModal from '../users/FaceZoomModal'; // THE FIX: Import the zoom modal

export default function SectionRoster({ section, onBack }) {
  const [activeTab, setActiveTab] = useState('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, student: null });
  const [confirmSchedModal, setConfirmSchedModal] = useState({ isOpen: false, scheduleId: null });
  
  const [cacheBuster] = useState(() => Date.now());
  const [enrolledStudents, setEnrolledStudents] = useState([]); 
  const [scheduleData, setScheduleData] = useState([]);
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  // THE FIX: State for handling zoomed images
  const [zoomedImage, setZoomedImage] = useState(null);

  const fetchRoster = useCallback(() => {
    fetch(`http://localhost:5106/api/sections/${section.section_ID}/students`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEnrolledStudents(data); })
      .catch(err => console.error(err));
  }, [section.section_ID]);

  const fetchSchedule = useCallback(() => {
    fetch(`http://localhost:5106/api/sections/${section.section_ID}/schedule`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setScheduleData(data); })
      .catch(err => console.error(err));
  }, [section.section_ID]);

  useEffect(() => { 
    fetchRoster(); 
    fetchSchedule();
  }, [fetchRoster, fetchSchedule]);

  const handleAddStudents = async (newStudents) => {
    const studentIds = newStudents.map(s => s.student_ID);
    try {
      const res = await fetch(`http://localhost:5106/api/sections/${section.section_ID}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentIds)
      });
      if (res.ok) fetchRoster(); 
    } catch (err) { console.error(err); }
  };

  const executeRemoveStudent = async () => {
    try {
      const res = await fetch(`http://localhost:5106/api/sections/${section.section_ID}/students/${confirmModal.student.student_ID}`, { method: 'DELETE' });
      if (res.ok) setEnrolledStudents(prev => prev.filter(s => s.student_ID !== confirmModal.student.student_ID));
    } catch (err) { console.error(err); }
    setConfirmModal({ isOpen: false, student: null });
  };

  const handleEditSchedule = (sched) => {
    setEditingSchedule(sched);
    setShowScheduleForm(true);
  };

  const executeDeleteSchedule = async () => {
    try {
      await fetch(`http://localhost:5106/api/schedules/${confirmSchedModal.scheduleId}`, { method: 'DELETE' });
      fetchSchedule();
    } catch (err) { console.error(err); }
    setConfirmSchedModal({ isOpen: false, scheduleId: null });
  };

  const filteredStudents = enrolledStudents.filter(student => {
    const fullName = `${student.last_Name} ${student.first_Name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || student.student_ID.includes(searchQuery);
  });

  const filteredSchedule = scheduleData.filter(sched => 
    sched.subject_Code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sched.subject_Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sched.professor_Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!section) return null;

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      
      {/* THE FIX: Render the FaceZoomModal component globally for this view */}
      <FaceZoomModal zoomedImage={zoomedImage} onClose={() => setZoomedImage(null)} />

      <AddStudentsModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddStudents} currentEnrollees={enrolledStudents} />
      <ConfirmModal isOpen={confirmModal.isOpen} type="danger" title="Remove Student" message={`Remove ${confirmModal.student?.first_Name} from this section?`} onConfirm={executeRemoveStudent} onCancel={() => setConfirmModal({ isOpen: false, student: null })} />
      <ConfirmModal isOpen={confirmSchedModal.isOpen} type="danger" title="Remove Subject" message="Remove this subject and schedule from the section?" onConfirm={executeDeleteSchedule} onCancel={() => setConfirmSchedModal({ isOpen: false, scheduleId: null })} />

      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{section.section_Name}</h2>
            <p className="text-sm font-bold text-slate-500">Block Section Master Roster</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
        <button 
          onClick={() => { setActiveTab('students'); setSearchQuery(''); setShowScheduleForm(false); }}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'students' 
              ? 'bg-blue-50/50 text-blue-700 border-blue-600' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
          }`}
        >
          <Users size={18} /> Student List <span className="ml-1 bg-white border border-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-600">{enrolledStudents.length}</span>
        </button>
        
        <button 
          onClick={() => { setActiveTab('subjects'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
            activeTab === 'subjects' 
              ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border-transparent'
          }`}
        >
          <BookOpen size={18} /> Schedules <span className="ml-1 bg-white border border-slate-200 text-xs px-2 py-0.5 rounded-full text-slate-600">{scheduleData.length}</span>
        </button>
      </div>

      {activeTab === 'subjects' && showScheduleForm ? (
         <ScheduleForm 
            schedule={editingSchedule} 
            sectionId={section.section_ID} 
            onBack={() => { setShowScheduleForm(false); setEditingSchedule(null); }} 
            onSuccess={() => { setShowScheduleForm(false); setEditingSchedule(null); fetchSchedule(); }}
         />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
          
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${activeTab === 'students' ? 'students' : 'schedules'}...`} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
            
            {activeTab === 'students' ? (
              <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
                <UserPlus size={18} /> Add Students
              </button>
            ) : (
              <button onClick={() => setShowScheduleForm(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap">
                <CalendarPlus size={18} /> Assign Subject
              </button>
            )}
          </div>

          {activeTab === 'students' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-200">
                <thead>
                  <tr className="bg-white text-xs uppercase text-slate-400 font-black border-b-2 border-slate-100">
                    <th className="p-4 w-24 text-center">Face</th>
                    <th className="p-4 w-32">Student ID</th>
                    <th className="p-4">Last Name</th>
                    <th className="p-4">First Name</th>
                    <th className="p-4 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((student) => (
                    <tr key={student.student_ID} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-3 flex justify-center items-center">
                        {/* THE FIX: Added onClick to zoom the student face and cursor/hover classes */}
                        {student.face_Reference_Path && !student.face_Reference_Path.includes("C:") ? (
                          <img 
                            src={`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`} 
                            alt="Face" 
                            onClick={() => setZoomedImage(`http://localhost:5106/ReferenceFaces/${student.face_Reference_Path}?t=${cacheBuster}`)}
                            className="w-10 h-10 object-cover aspect-square rounded-full border border-slate-200 shadow-sm cursor-zoom-in hover:opacity-80 transition-opacity" 
                          />
                        ) : (
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200"><Camera size={14}/></div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-blue-600 font-mono text-sm">{student.student_ID}</td>
                      <td className="p-4 font-black text-slate-800">{student.last_Name}</td>
                      <td className="p-4 font-bold text-slate-700">{student.first_Name}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => setConfirmModal({ isOpen: true, student })} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Remove Student">
                          <UserMinus size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-bold">Roster is empty.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-200">
                <thead>
                  <tr className="bg-white text-xs uppercase text-slate-400 font-black border-b-2 border-slate-100">
                    <th className="p-4 w-28">Code</th>
                    <th className="p-4 w-56">Subject Title</th>
                    <th className="p-4 w-16 text-center">Units</th>
                    <th className="p-4 min-w-[200px]">Assigned Professor</th>
                    <th className="p-4 w-56">Schedule & Room</th>
                    <th className="p-4 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSchedule.map((sched) => (
                    <tr key={sched.schedule_ID} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-indigo-600 font-mono text-sm">{sched.subject_Code}</td>
                      <td className="p-4 font-black text-slate-800 leading-tight">{sched.subject_Title}</td>
                      <td className="p-4 font-bold text-slate-500 text-center">{sched.units}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* THE FIX: Added onClick to zoom the professor face and cursor/hover classes */}
                          {sched.professor_Face_Reference_Path && !sched.professor_Face_Reference_Path.includes("C:") ? (
                            <img 
                              src={`http://localhost:5106/ReferenceFaces/${sched.professor_Face_Reference_Path}?t=${cacheBuster}`} 
                              alt="Professor" 
                              onClick={() => setZoomedImage(`http://localhost:5106/ReferenceFaces/${sched.professor_Face_Reference_Path}?t=${cacheBuster}`)}
                              className="w-8 h-8 object-cover aspect-square rounded-full border border-slate-200 shadow-sm shrink-0 cursor-zoom-in hover:opacity-80 transition-opacity" 
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-200 ${sched.professor_Name === 'Unassigned' ? 'bg-rose-50 text-rose-400' : 'bg-slate-100 text-slate-400'}`}>
                              <UserCircle size={16} />
                            </div>
                          )}
                          <span className={`font-bold text-sm ${sched.professor_Name === 'Unassigned' ? 'text-rose-600 italic' : 'text-slate-700'}`}>
                            {sched.professor_Name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <Clock size={14} className="text-amber-500" /> {sched.class_Days} | {sched.time_Start} - {sched.time_End}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <MapPin size={14} className="text-emerald-500" /> Room: {sched.room_ID}
                            </div>
                         </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditSchedule(sched)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setConfirmSchedModal({ isOpen: true, scheduleId: sched.schedule_ID })} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSchedule.length === 0 && (
                    <tr><td colSpan="6" className="p-12 text-center text-slate-500 font-bold">No subjects scheduled for this section yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}