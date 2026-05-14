import React, { useState, useEffect } from 'react';
import { User, ShieldAlert } from 'lucide-react';

export default function InterventionsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/student');
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const formatName = (first, middle, last) => {
    const m = middle ? ` ${middle}` : '';
    return `${last}, ${first}${m}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-white flex items-center space-x-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <ShieldAlert className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Student Interventions</h2>
          <p className="text-sm text-gray-500">Tracking students with frequent tardiness.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Lates</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading records...</td></tr>
            ) : students.map((student) => (
              <tr key={student.Student_ID} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{student.Student_ID}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.Face_Reference_Path ? (
                    <img 
                      src={`http://localhost:5106/ReferenceFaces/${student.Face_Reference_Path.split('/').pop()}`} 
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
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-base">
                  {formatName(student.First_Name, student.Middle_Name, student.Last_Name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="px-3 py-1 text-sm font-bold rounded-full bg-green-100 text-green-700">0</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400 italic">
                  No action required
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}