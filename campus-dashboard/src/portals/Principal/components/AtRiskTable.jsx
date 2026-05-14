import React from 'react';
import { UserMinus, CheckCircle } from 'lucide-react';

export default function AtRiskTable({ atRiskStudents, loading, handleExcuse, handleDrop }) {
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading intervention list...</div>;
  }

  if (atRiskStudents.length === 0) {
    return (
      <div className="p-12 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
        <p className="text-gray-500">No students are currently marked as unofficially dropped.</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Consecutive Absences</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Intervention Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {atRiskStudents.map((student) => (
          <tr key={student.Enrollment_ID} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-medium text-gray-900">{student.Student_Name}</div>
              <div className="text-sm text-gray-500">{student.Student_ID}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.Course}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{student.Section}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                {student.Absences} Absences
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
              <button 
                onClick={() => handleExcuse(student.Enrollment_ID, student.Student_Name)}
                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
              >
                Validate Excuse
              </button>
              {/* Removed inline-flex conflict here */}
              <button 
                onClick={() => handleDrop(student.Enrollment_ID, student.Student_Name, student.Section)}
                className="text-red-600 hover:text-red-900 flex items-center bg-red-50 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors"
              >
                <UserMinus className="h-4 w-4 mr-1" /> Official Drop
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}