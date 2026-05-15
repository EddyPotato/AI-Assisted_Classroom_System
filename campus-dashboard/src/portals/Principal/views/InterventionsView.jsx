import React, { useState, useEffect, useMemo } from 'react';
import { User, ShieldAlert, ArrowUpDown, ArrowUp, ArrowDown, Filter, Send, X, AlertCircle } from 'lucide-react';

export default function InterventionsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('Action Required');
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'asc' }); 

  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
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
            const mappedStudents = data.map((student) => {
              const rawSubjects = student.subjects || student.Subjects || '';
              const uniqueSubjects = [...new Set(rawSubjects.split(', ').filter(Boolean))].join(', ') || 'N/A';

              return {
                enrollmentId: student.enrollment_ID || student.Enrollment_ID,
                studentId: student.student_ID || student.Student_ID,
                firstName: student.first_Name || student.First_Name || '',
                middleName: student.middle_Name || student.Middle_Name || '',
                lastName: student.last_Name || student.Last_Name || '',
                facePath: student.face_Reference_Path || student.Face_Reference_Path,
                absences: student.absences || student.Absences || 0,
                status: student.status || student.Status || 'Enrolled',
                section: student.section || student.Section || 'Unassigned',
                subjects: uniqueSubjects
              };
            });
            setStudents(mappedStudents);
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

  // Grouping and Sorting Logic
  const groupedAndSortedStudents = useMemo(() => {
    let filtered = students;
    
    if (filterStatus === 'Action Required') {
      filtered = students.filter(s => s.status === 'Unofficially Dropped');
    } else if (filterStatus !== 'All') {
      filtered = students.filter(s => s.status === filterStatus);
    }
    
    // 1. Sort the flat list first
    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    // 2. Group by Student ID for the UI
    const grouped = [];
    const map = new Map();
    
    for (const item of filtered) {
      if (!map.has(item.studentId)) {
        map.set(item.studentId, {
          studentId: item.studentId,
          firstName: item.firstName,
          middleName: item.middleName,
          lastName: item.lastName,
          facePath: item.facePath,
          enrollments: []
        });
        grouped.push(map.get(item.studentId));
      }
      map.get(item.studentId).enrollments.push(item);
    }

    return grouped;
  }, [students, filterStatus, sortConfig]);

  const openInterventionModal = (student, enrollment) => {
    // Attach the student details to the specific enrollment being intervened on
    const contextData = { ...student, ...enrollment };
    setSelectedEnrollment(contextData);
    
    const fullName = `${contextData.firstName} ${contextData.middleName ? contextData.middleName + ' ' : ''}${contextData.lastName}`.trim();
    
    setEmailMessage(`Dear ${fullName},\n\nYou have currently accumulated ${contextData.absences} unexcused absences in the following subjects: ${contextData.subjects} (${contextData.section}).\n\nUnder university policy, you are now marked as Unofficially Dropped for this specific class.\n\nPlease report to the Principal's office within 48 hours with any valid medical certificates to resolve this issue, or proceed to the Registrar to process official dropping forms.\n\nRegards,\nPrincipal's Office`);
  };

  const sendEmail = async () => {
    setIsSending(true);
    try {
      const response = await fetch('http://localhost:5106/api/principal/send-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Enrollment_ID: selectedEnrollment.enrollmentId,
          Subject: "URGENT: Academic Standing Notice (Absences)",
          Message: emailMessage
        })
      });

      if (response.ok) {
        alert("Notice sent successfully!");
        setSelectedEnrollment(null);
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Officially Dropped': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-700 border border-gray-200">Officially Dropped</span>;
      case 'Unofficially Dropped': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700 border border-red-200">Unofficially Dropped</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700 border border-green-200">Enrolled</span>;
    }
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
              <p className="text-sm text-gray-500">Monitor absenteeism and official enrollment drops per subject.</p>
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
              <option value="All">All Students</option>
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
                <th onClick={() => handleSort('studentId')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">Student ID {getSortIcon('studentId')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Photo</th>
                <th onClick={() => handleSort('lastName')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">Last Name {getSortIcon('lastName')}</div>
                </th>
                <th onClick={() => handleSort('firstName')} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">First Name {getSortIcon('firstName')}</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Middle Name
                </th>
                {/* Specific Enrollment Data */}
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider border-l border-gray-200 bg-indigo-50/30">
                  Section
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">
                  Flagged Subjects
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">
                  Absences
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="10" className="p-12 text-center text-gray-500 font-medium">Loading records...</td></tr>
              ) : groupedAndSortedStudents.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-green-100 rounded-full">
                         <ShieldAlert className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
                      <p className="text-gray-500 font-medium">No students currently match this filter. Excellent attendance.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                groupedAndSortedStudents.map((student) => (
                  <React.Fragment key={student.studentId}>
                    {student.enrollments.map((env, idx) => (
                      <tr key={env.enrollmentId} className={`${idx === 0 ? 'border-t-2 border-gray-200' : 'border-t border-dashed border-gray-100'} hover:bg-gray-50 transition-colors`}>
                        
                        {/* 1. Student Profile Data (Only show on first row) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 font-bold bg-white">
                          {idx === 0 ? student.studentId : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap bg-white">
                          {idx === 0 && (
                            student.facePath ? (
                              <img src={`http://localhost:5106/ReferenceFaces/${student.facePath.split('/').pop()}`} alt="Student" className="h-10 w-10 rounded-lg object-cover border border-gray-200 shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = ''; }} />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200"><User className="h-5 w-5" /></div>
                            )
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 bg-white">
                          {idx === 0 ? student.lastName : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800 bg-white">
                          {idx === 0 ? student.firstName : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500 bg-white">
                          {idx === 0 ? (student.middleName || '-') : ''}
                        </td>
                        
                        {/* 2. Enrollment Specific Data (Shows on EVERY row) */}
                        <td className="px-6 py-4 whitespace-nowrap border-l border-gray-200 bg-gray-50/30">
                          <span className="text-sm font-black text-indigo-900">{env.section}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap bg-gray-50/30">
                           <span className={`text-sm font-bold ${env.absences >= 3 ? 'text-red-600' : 'text-gray-600'}`}>
                             {env.subjects}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center bg-gray-50/30">
                          <span className={`px-3 py-1 text-sm font-black rounded-full border ${
                            env.absences >= 3 ? 'bg-red-50 text-red-700 border-red-200' : 
                            env.absences > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>{env.absences}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center bg-gray-50/30">{getStatusBadge(env.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm bg-gray-50/30">
                          {env.status === 'Unofficially Dropped' ? (
                            <button 
                              onClick={() => openInterventionModal(student, env)}
                              className="text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-4 py-2 rounded-lg font-bold transition-all border border-indigo-200 shadow-sm"
                            >
                              Intervene
                            </button>
                          ) : (
                            <span className="text-gray-400 italic font-medium">No action</span>
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

      {/* --- EMAIL INTERVENTION MODAL --- */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Send className="h-5 w-5 mr-2 text-indigo-600" /> Issue Academic Warning
              </h3>
              <button onClick={() => setSelectedEnrollment(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 flex-1 bg-white">
              <div className="flex items-center space-x-3 mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">
                  This dispatches an official warning to <b>{selectedEnrollment.firstName} {selectedEnrollment.lastName}</b> and their guardian regarding <b>{selectedEnrollment.absences} absences</b> in <b>{selectedEnrollment.section} ({selectedEnrollment.subjects})</b>.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To</label>
                  <input type="text" disabled value={`${selectedEnrollment.studentId}@qcu.edu.ph, guardian_${selectedEnrollment.studentId}@gmail.com`} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                  <input type="text" disabled value={`URGENT: Academic Standing Notice - ${selectedEnrollment.subjects}`} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700 font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Message Body (Editable)</label>
                  <textarea 
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows="8"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={() => setSelectedEnrollment(null)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button 
                onClick={sendEmail}
                disabled={isSending}
                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center transition-all disabled:opacity-50 shadow-sm"
              >
                {isSending ? 'Dispatching...' : 'Dispatch Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}