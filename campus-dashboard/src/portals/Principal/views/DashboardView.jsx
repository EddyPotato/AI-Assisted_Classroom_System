import React, { useState, useEffect } from 'react';
import { Users, UserCheck, ShieldAlert, AlertCircle, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardView() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ totalStudents: 0, totalFaculty: 0, pendingInterventions: 0 });
  const [urgentStudents, setUrgentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch('http://localhost:5106/api/principal/dashboard-stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            totalStudents: data.TotalStudents ?? data.totalStudents ?? 0,
            totalFaculty: data.TotalFaculty ?? data.totalFaculty ?? 0,
            pendingInterventions: data.PendingInterventions ?? data.pendingInterventions ?? 0
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    const fetchUrgent = async () => {
      try {
        const studentsRes = await fetch('http://localhost:5106/api/principal/all-student-statuses');
        if (studentsRes.ok) {
          const data = await studentsRes.json();
          
          const atRisk = data
            .filter(s => s.status === 'Unofficially Dropped' || s.Status === 'Unofficially Dropped')
            .map(s => {
              const rawSubjects = s.Subjects || s.subjects || '';
              const uniqueSubjects = [...new Set(rawSubjects.split(', ').filter(Boolean))].join(', ') || 'N/A';
              return { ...s, uniqueSubjects };
            })
            .slice(0, 5);

          setUrgentStudents(atRisk);
        }
      } catch (error) {
        console.error("Failed to fetch urgent students", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchUrgent();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Principal's Command Center</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time academic overview and pending administrative actions.</p>
        </div>
      </div>
      
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><Users className="h-8 w-8" /></div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Registered Students</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{loading ? "..." : stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg shrink-0"><UserCheck className="h-8 w-8" /></div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Active Faculty</p>
            <h3 className="text-3xl font-black text-gray-900 mt-1">{loading ? "..." : stats.totalFaculty}</h3>
          </div>
        </div>

        <div className={`bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4 ${stats.pendingInterventions > 0 ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'}`}>
          <div className={`p-3 rounded-lg shrink-0 ${stats.pendingInterventions > 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Pending Interventions</p>
            <div className="flex items-center space-x-2 mt-1">
              <h3 className={`text-3xl font-black ${stats.pendingInterventions > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{loading ? "..." : stats.pendingInterventions}</h3>
              {stats.pendingInterventions > 0 && <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Action Req.</span>}
            </div>
          </div>
        </div>
      </div>

      {/* URGENT INTERVENTIONS FULL-WIDTH TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col mt-6">
        <div className="p-5 border-b border-gray-100 bg-white flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <AlertCircle className="h-6 w-6 mr-2 text-orange-600" />
            Urgent Interventions Queue
          </h3>
          <button 
            onClick={() => navigate('/principal/interventions')}
            className="text-sm text-indigo-600 font-bold hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            View All Reports <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Profile</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Flagged Subjects</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Absences</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-500 font-medium">Scanning academic records...</td></tr>
              ) : urgentStudents.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-500 font-bold">All clear! No students currently require intervention.</td></tr>
              ) : (
                urgentStudents.map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {student.Face_Reference_Path || student.face_Reference_Path ? (
                          <img src={`http://localhost:5106/ReferenceFaces/${(student.Face_Reference_Path || student.face_Reference_Path).split('/').pop()}`} className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200"><User className="h-5 w-5" /></div>
                        )}
                        <div>
                          {/* THE FIX: Added Middle Name to Dashboard Queue */}
                          <p className="text-sm font-bold text-gray-900">
                            {student.First_Name || student.first_Name} {(student.Middle_Name || student.middle_Name) ? (student.Middle_Name || student.middle_Name) + ' ' : ''}{student.Last_Name || student.last_Name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{student.Student_ID || student.student_ID}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">{student.Section || student.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-red-600">{student.uniqueSubjects}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-3 py-1 text-sm font-black rounded-full border bg-red-50 text-red-700 border-red-200">
                        {student.Absences || student.absences}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => navigate('/principal/interventions')}
                        className="text-indigo-600 hover:text-indigo-900 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Review File
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}