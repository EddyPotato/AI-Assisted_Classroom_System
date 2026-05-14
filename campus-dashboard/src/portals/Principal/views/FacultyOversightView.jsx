import React, { useState, useEffect } from 'react';
import { User, UserCheck } from 'lucide-react';

export default function FacultyOversightView() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await fetch('http://localhost:5106/api/staff');
        if (response.ok) {
          const data = await response.json();
          // Filter out guards/admins, keep only Faculty
          const profs = data.filter(u => u.Role === 'Faculty' || u.role === 'Faculty');
          
          // Generate realistic mock "lates" for the UI demonstration
          const mappedProfs = profs.map((prof, index) => {
            let mockLates = 0;
            if (index % 4 === 0) mockLates = 4; // High lates
            else if (index % 3 === 0) mockLates = 2; // Medium lates
            return { ...prof, lates: mockLates };
          });
          
          setFaculty(mappedProfs);
        }
      } catch (error) {
        console.error("Failed to fetch faculty", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const formatName = (first, middle, last) => {
    const m = middle ? ` ${middle}` : '';
    return `${last}, ${first}${m}`;
  };

  const getLateBadge = (lates) => {
    if (lates === 0) return <span className="px-3 py-1 text-sm font-bold rounded-full bg-green-100 text-green-700 border border-green-200">0</span>;
    if (lates <= 3) return <span className="px-3 py-1 text-sm font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-200">{lates}</span>;
    return <span className="px-3 py-1 text-sm font-bold rounded-full bg-red-100 text-red-700 border border-red-200">{lates}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-white flex items-center space-x-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <UserCheck className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Faculty Oversight</h2>
          <p className="text-sm text-gray-500">Monitoring professor punctuality to assigned classes.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Professor ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Lates to Class</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading faculty records...</td></tr>
            ) : faculty.map((prof) => (
              <tr key={prof.User_ID} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{prof.User_ID}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {prof.Face_Reference_Path ? (
                    <img 
                      src={`http://localhost:5106/ReferenceFaces/${prof.Face_Reference_Path.split('/').pop()}`} 
                      alt="Professor" 
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
                  {formatName(prof.First_Name, prof.Middle_Name, prof.Last_Name)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getLateBadge(prof.lates)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  {prof.lates >= 4 ? (
                    <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md font-semibold hover:bg-indigo-100 transition-colors">
                      Issue Warning Email
                    </button>
                  ) : (
                    <span className="text-gray-400 italic">No action required</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}