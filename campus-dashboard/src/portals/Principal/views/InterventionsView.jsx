import React, { useState, useEffect, useMemo } from 'react';
import { User, ShieldAlert, ArrowUpDown, ArrowUp, ArrowDown, Filter, Send, X, AlertCircle, CornerDownRight } from 'lucide-react';

export default function InterventionsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('Action Required');
  const [sortConfig, setSortConfig] = useState({ key: 'section', direction: 'asc' }); 

  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/principal/all-student-statuses');
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            const mapped = data.map(s => ({
              enrollmentId: s.enrollment_ID || s.Enrollment_ID,
              studentId: s.student_ID || s.Student_ID,
              firstName: s.first_Name || s.First_Name || '',
              middleName: s.middle_Name || s.Middle_Name || '',
              lastName: s.last_Name || s.Last_Name || '',
              facePath: s.face_Reference_Path || s.Face_Reference_Path,
              section: s.section || s.Section || 'TBA',
              scheduleId: s.schedule_ID || s.Schedule_ID,
              subjectCode: s.subject_Code || s.Subject_Code,
              subjectTitle: s.subject_Title || s.Subject_Title,
              absences: s.absences || s.Absences || 0,
              status: s.status || s.Status || 'Enrolled'
            }));
            setStudents(mapped);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
        if (isMounted) setLoading(false);
      }
    };

    fetchStudents();
    return () => { isMounted = false; };
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // 1. Group the Flat Subject List by Student ID
  const groupedStudents = useMemo(() => {
    const map = new Map();
    
    // Filter the raw subjects based on the dropdown
    const filteredSubjects = students.filter(s => {
      if (filterStatus === 'Action Required') return s.status === 'Unofficially Dropped';
      if (filterStatus === 'All') return true;
      return s.status === filterStatus;
    });

    for (const item of filteredSubjects) {
      if (!map.has(item.studentId)) {
        map.set(item.studentId, {
          studentId: item.studentId,
          firstName: item.firstName,
          middleName: item.middleName,
          lastName: item.lastName,
          facePath: item.facePath,
          section: item.section,
          subjects: []
        });
      }
      map.get(item.studentId).subjects.push(item);
    }

    const groupedArray = Array.from(map.values());

    // Sort the Master Rows
    return groupedArray.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, filterStatus, sortConfig]);


  const openInterventionModal = (student, subject) => {
    setSelectedIntervention({ student, subject });
    const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`.trim();
    setEmailMessage(`Dear ${fullName},\n\nYou have currently accumulated ${subject.absences} unexcused absences in ${subject.subjectCode} (${subject.subjectTitle}).\n\nUnder university policy, you are now marked as Unofficially Dropped for this specific schedule.\n\nPlease report to the Principal's office within 48 hours to resolve this issue.\n\nRegards,\nPrincipal's Office`);
  };

  const sendEmail = async () => {
    setIsSending(true);
    try {
      const response = await fetch('http://localhost:5106/api/principal/send-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Enrollment_ID: selectedIntervention.subject.enrollmentId,
          Schedule_ID: selectedIntervention.subject.scheduleId,
          Subject: `URGENT: Academic Notice - ${selectedIntervention.subject.subjectCode}`,
          Message: emailMessage
        })
      });

      if (response.ok) {
        alert("Notice sent successfully!");
        setSelectedIntervention(null);
      }
    } catch (error) {
      console.error("Email failed", error);
    } finally {
      setIsSending(false);
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 ml-1 text-indigo-600" /> : <ArrowDown className="h-3 w-3 ml-1 text-indigo-600" />;
  };

  return (
    <div className="relative h-full animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
        
        <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShieldAlert className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Student Interventions</h2>
              <p className="text-sm text-gray-500">Monitor absenteeism per subject schedule.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="Action Required">Action Required (At-Risk)</option>
              <option value="All">All Statuses</option>
              <option value="Enrolled">Active / Enrolled</option>
              <option value="Unofficially Dropped">Unofficially Dropped</option>
              <option value="Officially Dropped">Officially Dropped</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th onClick={() => handleSort('section')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-32">
                  <div className="flex items-center">Section {getSortIcon('section')}</div>
                </th>
                <th onClick={() => handleSort('studentId')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-32">
                  <div className="flex items-center">Student ID {getSortIcon('studentId')}</div>
                </th>
                <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Photo</th>
                <th onClick={() => handleSort('lastName')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">Last Name {getSortIcon('lastName')}</div>
                </th>
                <th onClick={() => handleSort('firstName')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">First Name {getSortIcon('firstName')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Middle Name</th>
                {/* Right side aligned for subject details */}
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/50 border-l border-gray-200">Subject Details</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/50">Absences</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/50">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/50">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loading ? (
                <tr><td colSpan="10" className="p-12 text-center text-gray-500 font-medium">Loading records...</td></tr>
              ) : groupedStudents.length === 0 ? (
                <tr><td colSpan="10" className="p-16 text-center text-gray-500 font-medium">No students match this filter.</td></tr>
              ) : (
                groupedStudents.map((student) => (
                  <React.Fragment key={student.studentId}>
                    
                    {/* MASTER ROW (Student Identity) */}
                    <tr className="bg-white border-t-4 border-gray-100 hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <span className="text-sm font-black text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md">{student.section}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-500 align-top">{student.studentId}</td>
                      <td className="px-4 py-4 whitespace-nowrap align-top flex justify-center">
                        {student.facePath ? (
                          <img src={`http://localhost:5106/ReferenceFaces/${student.facePath.split('/').pop()}`} className="h-10 w-10 rounded-lg object-cover border border-gray-200 shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = ''; }} />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200"><User className="h-5 w-5" /></div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-black text-gray-900 text-lg align-top">{student.lastName}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700 align-top">{student.firstName}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500 align-top">{student.middleName || '-'}</td>
                      
                      {/* Blank placeholders for the Master Row's detail section */}
                      <td colSpan="4" className="border-l border-gray-100"></td>
                    </tr>

                    {/* DETAIL ROWS (Specific Subjects) */}
                    {student.subjects.map((subj) => (
                      <tr key={subj.scheduleId} className="bg-slate-50 border-t border-slate-200/50 hover:bg-indigo-50/30 transition-colors">
                        <td colSpan="6" className="p-0 border-r border-slate-200/50"></td>
                        
                        <td className="px-6 py-3 whitespace-nowrap flex items-center">
                          <CornerDownRight className="h-4 w-4 text-slate-300 mr-2 shrink-0" />
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold ${subj.absences >= 3 ? 'text-red-700' : 'text-slate-800'}`}>{subj.subjectCode}</span>
                            <span className="text-xs text-slate-500 truncate max-w-50">{subj.subjectTitle}</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                          <span className={`px-2.5 py-1 text-sm font-black rounded-md border ${
                            subj.absences >= 3 ? 'bg-red-100 text-red-700 border-red-200' : 
                            subj.absences > 0 ? 'bg-orange-100 text-orange-700 border-orange-200' :
                            'bg-green-100 text-green-700 border-green-200'
                          }`}>{subj.absences}</span>
                        </td>
                        
                        <td className="px-6 py-3 whitespace-nowrap text-center">
                           {subj.status === 'Unofficially Dropped' && <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-red-100 text-red-700 border border-red-200 uppercase">Unofficially Dropped</span>}
                           {subj.status === 'Enrolled' && <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-green-100 text-green-700 border border-green-200 uppercase">Enrolled</span>}
                           {subj.status === 'Officially Dropped' && <span className="px-2.5 py-1 text-[11px] font-bold rounded bg-gray-100 text-gray-600 border border-gray-200 uppercase">Officially Dropped</span>}
                        </td>

                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          {subj.status === 'Unofficially Dropped' ? (
                            <button 
                              onClick={() => openInterventionModal(student, subj)}
                              className="text-indigo-700 hover:text-white bg-white hover:bg-indigo-600 px-3 py-1.5 rounded text-xs font-bold transition-all border border-indigo-200 shadow-sm"
                            >
                              Intervene
                            </button>
                          ) : (
                            <span className="text-slate-300 text-xs italic font-medium">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL --- */}
      {selectedIntervention && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <Send className="h-5 w-5 mr-2 text-indigo-600" /> Issue Academic Warning
              </h3>
              <button onClick={() => setSelectedIntervention(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 flex-1 bg-white">
              <div className="flex items-center space-x-3 mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">
                  Dispatching official warning to <b>{selectedIntervention.student.firstName} {selectedIntervention.student.lastName}</b> regarding <b>{selectedIntervention.subject.absences} absences</b> specifically in <b>{selectedIntervention.subject.subjectCode}</b>.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
                  <input type="text" disabled value={`${selectedIntervention.student.studentId}@qcu.edu.ph, guardian_${selectedIntervention.student.studentId}@gmail.com`} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-700 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message Body (Editable)</label>
                  <textarea 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows="8"
                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button onClick={() => setSelectedIntervention(null)} className="px-5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={sendEmail} disabled={isSending} className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center transition-all disabled:opacity-50 shadow-sm">
                {isSending ? 'Dispatching...' : 'Dispatch Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}