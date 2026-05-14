import React from 'react';
import { CheckCircle, FileText } from 'lucide-react';

export default function AtRiskTable({ atRiskStudents, loading, onReviewReport }) {
  if (loading) {
    return <div className="p-12 text-center text-gray-500 font-medium">Loading intervention list...</div>;
  }

  if (atRiskStudents.length === 0) {
    return (
      <div className="p-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">All Clear!</h3>
        <p className="text-gray-500 mt-2">No students are currently flagged for excessive absences.</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Program</th>
          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Section</th>
          <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {atRiskStudents.map((student) => (
          <tr key={student.Enrollment_ID} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-bold text-gray-900 text-base">{student.Student_Name}</div>
              <div className="text-sm text-gray-500 font-mono mt-0.5">{student.Student_ID}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{student.Course}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{student.Section}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
              <span className="px-3 py-1 text-sm font-bold rounded-full bg-red-100 text-red-700 border border-red-200">
                {student.Absences} Absences
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
              {/* SINGLE BUTTON TO OPEN MODAL */}
              <button 
                onClick={() => onReviewReport(student)}
                className="inline-flex items-center text-indigo-700 bg-indigo-50 px-4 py-2 rounded-md hover:bg-indigo-100 hover:text-indigo-900 transition-colors font-semibold shadow-sm border border-indigo-100"
              >
                <FileText className="h-4 w-4 mr-2" /> 
                Review Report
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}