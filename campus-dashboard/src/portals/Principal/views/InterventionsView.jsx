import React, { useState, useEffect, useMemo } from 'react';
import { User, ShieldAlert, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';

export default function InterventionsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New States for Filtering and Sorting
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'absents', direction: 'desc' }); // Default to highest absents first

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/student');
        if (response.ok) {
          const data = await response.json();
          
          // Data Mapping & UI Simulation
          const mappedStudents = data.map((student, index) => {
            // Simulate absences and statuses for the UI demonstration
            let absents = 0;
            let status = 'Enrolled';
            
            if (index % 7 === 0) { absents = 3; status = 'Unofficially Dropped'; }
            else if (index % 12 === 0) { absents = 5; status = 'Officially Dropped'; }
            else if (index % 5 === 0) { absents = 1; }

            return {
              ...student,
              studentId: student.student_ID || student.Student_ID || 'UNKNOWN',
              firstName: student.first_Name || student.First_Name || '',
              middleName: student.middle_Name || student.Middle_Name || '',
              lastName: student.last_Name || student.Last_Name || '',
              facePath: student.face_Reference_Path || student.Face_Reference_Path || '',
              absents,
              status
            };
          });
          
          setStudents(mappedStudents);
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Handler for clicking column headers
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Memoized Filtering and Sorting Logic
  const processedStudents = useMemo(() => {
    // 1. Filter
    let filtered = students;
    if (filterStatus !== 'All') {
      filtered = students.filter(s => s.status === filterStatus);
    }

    // 2. Sort
    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, filterStatus, sortConfig]);

  // Helper to render sort icons
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1 text-indigo-600" /> 
      : <ArrowDown className="h-3 w-3 ml-1 text-indigo-600" />;
  };

  // Helper for Status Badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Officially Dropped': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-gray-100 text-gray-700 border border-gray-200">Officially Dropped</span>;
      case 'Unofficially Dropped': return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-red-100 text-red-700 border border-red-200">Unofficially Dropped</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-green-100 text-green-700 border border-green-200">Enrolled</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* Header & Filter Controls */}
      <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ShieldAlert className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Interventions & Status</h2>
            <p className="text-sm text-gray-500">Monitor absenteeism and official enrollment drops.</p>
          </div>
        </div>
        
        {/* Status Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm font-bold text-gray-700 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Enrolled">Active / Enrolled</option>
            <option value="Unofficially Dropped">Unofficially Dropped (At-Risk)</option>
            <option value="Officially Dropped">Officially Dropped</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('studentId')}
              >
                <div className="flex items-center">Student ID {getSortIcon('studentId')}</div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Photo</th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('lastName')}
              >
                <div className="flex items-center">Last Name {getSortIcon('lastName')}</div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('firstName')}
              >
                <div className="flex items-center">First Name {getSortIcon('firstName')}</div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('middleName')}
              >
                <div className="flex items-center">Middle Name {getSortIcon('middleName')}</div>
              </th>
              <th 
                className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                onClick={() => handleSort('absents')}
              >
                <div className="flex items-center justify-center">ABSENTS {getSortIcon('absents')}</div>
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">Loading records...</td></tr>
            ) : processedStudents.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500 font-medium">No students found for this filter.</td></tr>
            ) : processedStudents.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{student.studentId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.facePath ? (
                    <img 
                      src={`http://localhost:5106/ReferenceFaces/${student.facePath.split('/').pop()}`} 
                      alt="Student" 
                      className="h-10 w-10 rounded-lg object-cover border border-gray-200 shadow-sm"
                      onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{student.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{student.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{student.middleName || '-'}</td>
                
                {/* Dynamic Absents Column */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 text-sm font-black rounded-full border ${
                    student.absents >= 3 ? 'bg-red-50 text-red-700 border-red-200' : 
                    student.absents > 0 ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {student.absents}
                  </span>
                </td>
                
                {/* Status Column */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(student.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}