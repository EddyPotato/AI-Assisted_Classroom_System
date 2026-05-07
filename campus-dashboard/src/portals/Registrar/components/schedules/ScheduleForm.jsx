import { useState, useEffect } from 'react';
import { ArrowLeft, Save, CalendarPlus, Edit2, Search, UserCircle, Building2, CheckSquare, Square, BookOpen } from 'lucide-react';

export default function ScheduleForm({ schedule, sectionId, onBack, onSuccess }) {
  const isEditing = !!schedule;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cacheBuster] = useState(() => Date.now());

  const [formData, setFormData] = useState({
    schedule_ID: schedule?.schedule_ID || '',
    subject_Code: schedule?.subject_Code || '',
    subject_Type: schedule?.subject_Type || 'Lec',
    section_ID: sectionId || schedule?.section_ID || '',
    professor_ID: schedule?.professor_ID || '',
    room_ID: schedule?.room_ID || ''
  });

  const [staffList, setStaffList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [subjectList, setSubjectList] = useState([]); // NEW: State for subjects
  
  // Start search strings empty to avoid the "parenthesis search" bug
  const [profSearch, setProfSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState(''); // NEW: Search for subjects
  
  const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false); // NEW: Dropdown toggle

  const standardDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [selectedDays, setSelectedDays] = useState(schedule?.class_Days && schedule.class_Days !== 'TBA' ? schedule.class_Days.split('/') : []);
  
  const parse24Hour = (time12) => {
    if (!time12 || time12 === 'TBA') return '';
    let [time, period] = time12.split(' ');
    if (!time || !period) return time12;
    let [h, m] = time.split(':');
    h = parseInt(h, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const [timeStart24, setTimeStart24] = useState(parse24Hour(schedule?.time_Start));
  const [timeEnd24, setTimeEnd24] = useState(parse24Hour(schedule?.time_End));

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('http://localhost:5106/api/staff').then(r => r.json()).catch(() => []),
      fetch('http://localhost:5106/api/rooms').then(r => r.json()).catch(() => []),
      fetch('http://localhost:5106/api/subjects').then(r => r.json()).catch(() => []) // NEW: Fetch subjects
    ]).then(([staff, rooms, subjects]) => {
      if (isMounted) {
        setStaffList(Array.isArray(staff) ? staff : []);
        setRoomList(Array.isArray(rooms) ? rooms : []);
        setSubjectList(Array.isArray(subjects) ? subjects : []);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const selectProf = (staff) => {
    setFormData({ ...formData, professor_ID: staff.user_ID });
    setIsProfDropdownOpen(false);
    setProfSearch(''); 
  };

  const selectRoom = (room) => {
    setFormData({ ...formData, room_ID: room.room_ID });
    setIsRoomDropdownOpen(false);
    setRoomSearch(''); 
  };

  const selectSubject = (subject) => {
    setFormData({ ...formData, subject_Code: subject.subject_Code });
    setIsSubjectDropdownOpen(false);
    setSubjectSearch(''); 
  };

  const format12Hour = (time24) => {
    if (!time24) return 'TBA';
    let [h, m] = time24.split(':');
    let period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${period}`;
  };

  const timeToMinutes = (time24) => {
    if (!time24) return 0;
    const [h, m] = time24.split(':').map(Number);
    return h * 60 + m;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject_Code) {
      alert("Please select a subject from the dropdown.");
      return;
    }

    if (timeStart24 && timeEnd24) {
      if (timeToMinutes(timeStart24) >= timeToMinutes(timeEnd24)) {
        alert("Safety Warning: Time End must be later than Time Start.");
        return;
      }
    }

    setIsSubmitting(true);

    const url = isEditing ? `http://localhost:5106/api/schedules/${formData.schedule_ID}` : 'http://localhost:5106/api/schedules';
    
    const payload = { 
      ...formData,
      class_Days: selectedDays.length > 0 ? selectedDays.join('/') : 'TBA',
      time_Start: format12Hour(timeStart24),
      time_End: format12Hour(timeEnd24)
    };

    if (!isEditing && !payload.schedule_ID) {
      payload.schedule_ID = "SCH-" + Math.floor(1000 + Math.random() * 9000).toString();
    }

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) onSuccess();
      else alert("Failed to save schedule. Ensure the Subject Code exists.");
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
      if (s.role !== 'Faculty') return false; 
      const name = `${s.first_Name} ${s.middle_Name || ''} ${s.last_Name}`.toLowerCase();
      return name.includes(profSearch.toLowerCase()) || s.user_ID.toLowerCase().includes(profSearch.toLowerCase());
  });

  const filteredRooms = roomList.filter(r => 
      r.room_ID.toLowerCase().includes(roomSearch.toLowerCase()) || 
      (r.building && r.building.toLowerCase().includes(roomSearch.toLowerCase()))
  );

  const filteredSubjects = subjectList.filter(s => 
      s.subject_Code.toLowerCase().includes(subjectSearch.toLowerCase()) || 
      (s.title && s.title.toLowerCase().includes(subjectSearch.toLowerCase()))
  );

  const selectedProfObj = staffList.find(s => s.user_ID === formData.professor_ID) || 
    (isEditing && formData.professor_ID === schedule.professor_ID && schedule.professor_Name !== 'Unassigned' ? {
      user_ID: schedule.professor_ID,
      full_Name: schedule.professor_Name, 
      face_Reference_Path: schedule.professor_Face_Reference_Path
    } : null);

  const selectedRoomObj = roomList.find(r => r.room_ID === formData.room_ID) || 
    (isEditing && formData.room_ID === schedule.room_ID ? {
      room_ID: schedule.room_ID,
      building: schedule.building
    } : null);

  const selectedSubjectObj = subjectList.find(s => s.subject_Code === formData.subject_Code) || 
    (isEditing && formData.subject_Code === schedule.subject_Code ? {
      subject_Code: schedule.subject_Code,
      title: schedule.subject_Title // Relies on the mapped title from the DB if already saved
    } : null);

  return (
    <div className="animate-in slide-in-from-right-8 duration-300 pb-10">
      
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm w-full">
        <div className="flex items-center gap-4">
          <button onClick={onBack} type="button" className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {isEditing ? <><Edit2 className="text-amber-500" /> Edit Subject Assignment</> : <><CalendarPlus className="text-blue-600" /> Add Subject to Section</>}
            </h2>
            <p className="text-sm font-bold text-slate-500">Assign a new subject, professor, and room.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 w-full">
        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Subject Code & Type */}
            <div className="flex gap-4 col-span-1">
               
               {/* Smart Subject Dropdown */}
               <div className="flex-1 relative">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject <span className="text-rose-500">*</span></label>
                 
                 {formData.subject_Code && !isSubjectDropdownOpen && selectedSubjectObj ? (
                    <div 
                       onClick={() => { setIsSubjectDropdownOpen(true); setSubjectSearch(''); }}
                       className="w-full flex items-center gap-3 px-4 py-2 h-12.5 border border-slate-300 rounded-xl bg-white shadow-sm cursor-text transition-all hover:border-indigo-400 group"
                    >
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm shrink-0"><BookOpen size={16}/></div>
                       <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm leading-tight truncate">{selectedSubjectObj.subject_Code}</p>
                          <p className="text-[10px] font-bold text-slate-500 truncate">{selectedSubjectObj.title || 'Subject Details'}</p>
                       </div>
                       <Search size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                    </div>
                 ) : (
                    <div className="relative">
                       <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                          autoFocus={isSubjectDropdownOpen}
                          type="text" 
                          value={subjectSearch} 
                          onChange={(e) => { setSubjectSearch(e.target.value); setIsSubjectDropdownOpen(true); }}
                          onFocus={() => setIsSubjectDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setIsSubjectDropdownOpen(false), 200)}
                          placeholder="Search code or title..." 
                          className="w-full pl-9 pr-4 py-3 h-12.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm transition-all" 
                       />
                    </div>
                 )}
                 
                 {isSubjectDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-50">
                       <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Subject Suggestions</div>
                       {filteredSubjects.map(sub => (
                           <div key={sub.subject_Code} onMouseDown={() => selectSubject(sub)} className="flex items-center gap-3 p-3 hover:bg-indigo-50 cursor-pointer transition-colors group">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600"><BookOpen size={20}/></div>
                              <div>
                                 <p className="font-black text-slate-800 text-sm group-hover:text-indigo-700">{sub.subject_Code}</p>
                                 <p className="text-xs font-bold text-slate-500">{sub.title}</p>
                              </div>
                           </div>
                       ))}
                       {filteredSubjects.length === 0 && <div className="p-4 text-center text-sm font-bold text-slate-400">No subjects found.</div>}
                    </div>
                 )}
               </div>
               
               <div className="w-36">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                 <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner h-12.5 items-center">
                    <button type="button" onClick={() => setFormData({...formData, subject_Type: 'Lec'})} className={`flex-1 h-full text-sm font-black rounded-lg transition-all ${formData.subject_Type === 'Lec' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>LEC</button>
                    <button type="button" onClick={() => setFormData({...formData, subject_Type: 'Lab'})} className={`flex-1 h-full text-sm font-black rounded-lg transition-all ${formData.subject_Type === 'Lab' ? 'bg-white text-amber-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>LAB</button>
                 </div>
               </div>
            </div>

            {/* Smart Professor Dropdown */}
            <div className="relative col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned Professor</label>
              
              {formData.professor_ID && !isProfDropdownOpen && selectedProfObj ? (
                 <div 
                    onClick={() => { setIsProfDropdownOpen(true); setProfSearch(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2 h-12.5 border border-slate-300 rounded-xl bg-white shadow-sm cursor-text transition-all hover:border-blue-400 group"
                 >
                    {selectedProfObj?.face_Reference_Path && !selectedProfObj.face_Reference_Path.includes("C:") ? (
                       <img src={`http://localhost:5106/ReferenceFaces/${selectedProfObj.face_Reference_Path}?t=${cacheBuster}`} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" alt="avatar" />
                    ) : (
                       <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm"><UserCircle size={16}/></div>
                    )}
                    <div className="flex-1 min-w-0">
                       <p className="font-black text-slate-800 text-sm leading-tight truncate">
                          {selectedProfObj?.full_Name || [selectedProfObj?.first_Name, selectedProfObj?.middle_Name, selectedProfObj?.last_Name].filter(Boolean).join(' ')}
                       </p>
                       <p className="text-[10px] font-bold text-slate-500 font-mono truncate">{selectedProfObj?.user_ID}</p>
                    </div>
                    <Search size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" />
                 </div>
              ) : (
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                       autoFocus={isProfDropdownOpen}
                       type="text" 
                       value={profSearch} 
                       onChange={(e) => { setProfSearch(e.target.value); setIsProfDropdownOpen(true); }}
                       onFocus={() => setIsProfDropdownOpen(true)} 
                       onBlur={() => setTimeout(() => setIsProfDropdownOpen(false), 200)}
                       placeholder="Type to search professors..." 
                       className="w-full pl-9 pr-4 py-3 h-12.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm transition-all" 
                    />
                 </div>
              )}
              
              {isProfDropdownOpen && (
                 <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-50">
                    <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Professor Suggestions</div>
                    {filteredStaff.map(staff => (
                        <div key={staff.user_ID} onMouseDown={() => selectProf(staff)} className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors group">
                           {staff.face_Reference_Path && !staff.face_Reference_Path.includes("C:") ? (
                              <img src={`http://localhost:5106/ReferenceFaces/${staff.face_Reference_Path}?t=${cacheBuster}`} alt="Face" className="w-10 h-10 object-cover rounded-full border border-slate-200 shadow-sm group-hover:border-blue-300" />
                           ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><UserCircle size={20}/></div>
                           )}
                           <div>
                              <p className="font-black text-slate-800 text-sm group-hover:text-blue-700">{staff.first_Name} {[staff.middle_Name, staff.last_Name].filter(Boolean).join(' ')}</p>
                              <p className="text-xs font-bold text-slate-500 font-mono">{staff.user_ID}</p>
                           </div>
                        </div>
                    ))}
                    {filteredStaff.length === 0 && <div className="p-4 text-center text-sm font-bold text-slate-400">No professors found.</div>}
                 </div>
              )}
            </div>

            {/* Smart Room Dropdown */}
            <div className="relative col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room Assignment</label>
              
              {formData.room_ID && !isRoomDropdownOpen && selectedRoomObj ? (
                 <div 
                    onClick={() => { setIsRoomDropdownOpen(true); setRoomSearch(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2 h-12.5 border border-slate-300 rounded-xl bg-white shadow-sm cursor-text transition-all hover:border-emerald-400 group"
                 >
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm shrink-0"><Building2 size={16}/></div>
                    <div className="flex-1 min-w-0">
                       <p className="font-black text-slate-800 text-sm leading-tight truncate">{selectedRoomObj?.room_ID}</p>
                       <p className="text-[10px] font-bold text-slate-500 truncate">
                         {selectedRoomObj?.building ? `${selectedRoomObj.building} ${selectedRoomObj.floor ? `(Floor ${selectedRoomObj.floor})` : ''}` : 'Loading facility details...'}
                       </p>
                    </div>
                    <Search size={16} className="text-slate-300 group-hover:text-emerald-400 transition-colors shrink-0" />
                 </div>
              ) : (
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                       autoFocus={isRoomDropdownOpen}
                       type="text" 
                       value={roomSearch} 
                       onChange={(e) => { setRoomSearch(e.target.value); setIsRoomDropdownOpen(true); }}
                       onFocus={() => setIsRoomDropdownOpen(true)} 
                       onBlur={() => setTimeout(() => setIsRoomDropdownOpen(false), 200)}
                       placeholder="Type to search rooms..." 
                       className="w-full pl-9 pr-4 py-3 h-12.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 shadow-sm transition-all" 
                    />
                 </div>
              )}
              
              {isRoomDropdownOpen && (
                 <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-50">
                    <div className="p-3 text-xs font-bold text-slate-400 uppercase bg-slate-50/50">Facility Suggestions</div>
                    {filteredRooms.map(room => (
                        <div key={room.room_ID} onMouseDown={() => selectRoom(room)} className="flex items-center gap-3 p-3 hover:bg-emerald-50 cursor-pointer transition-colors group">
                           <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-emerald-600"><Building2 size={20}/></div>
                           <div>
                              <p className="font-black text-slate-800 text-sm group-hover:text-emerald-700">{room.room_ID}</p>
                              <p className="text-xs font-bold text-slate-500">{room.building} {room.floor ? `(Floor ${room.floor})` : ''}</p>
                           </div>
                        </div>
                    ))}
                    {filteredRooms.length === 0 && <div className="p-4 text-center text-sm font-bold text-slate-400">No rooms found.</div>}
                 </div>
              )}
            </div>

            {/* Checkbox Days */}
            <div className="col-span-1 md:col-span-2 pt-2 md:pt-4 md:border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Class Days</label>
              <div className="flex flex-wrap gap-3">
                 {standardDays.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                        <div 
                           key={day} 
                           onClick={() => toggleDay(day)}
                           className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all border select-none ${
                               isSelected ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm ring-1 ring-blue-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                           }`}
                        >
                           {isSelected ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-300" />}
                           <span className="font-bold text-sm">{day}</span>
                        </div>
                    );
                 })}
              </div>
            </div>
            
            {/* Native Time Pickers */}
            <div className="col-span-1 flex gap-4 pt-2 md:pt-4 md:border-t border-slate-100">
               <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Start</label>
                 <input 
                    type="time" 
                    value={timeStart24} 
                    onChange={(e) => setTimeStart24(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm cursor-text h-12.5" 
                 />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time End</label>
                 <input 
                    type="time" 
                    value={timeEnd24} 
                    onChange={(e) => setTimeEnd24(e.target.value)} 
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 shadow-sm cursor-text h-12.5" 
                 />
               </div>
            </div>

          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="px-8 py-3 font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 bg-blue-600 hover:bg-blue-700">
               <Save size={18}/> {isSubmitting ? 'Saving...' : 'Save Subject to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}