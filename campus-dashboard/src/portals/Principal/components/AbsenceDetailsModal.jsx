import React from 'react';
import { X, Calendar, Clock, UserMinus, ShieldCheck } from 'lucide-react';

export default function AbsenceDetailsModal({ student, onClose, onExcuse, onDrop }) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Detailed Absence Report
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Reviewing unexcused absences for <span className="font-semibold text-gray-700">{student.Student_Name}</span> ({student.Student_ID})
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body: The Table */}
        <div className="p-6 overflow-y-auto bg-white flex-1">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Absence Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Class Time</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Professor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Note: We map through the detailed absence array fetched from the backend */}
              {student.absenceDetails?.map((absence, index) => (
                <tr key={index} className="hover:bg-red-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{absence.Date_Formatted}</div>
                    <div className="text-xs text-red-600 font-medium">Unexcused</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-1.5 text-gray-400" />
                      {absence.Time_12Hour}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{absence.Subject_Code}</div>
                    <div className="text-xs text-gray-500">{absence.Subject_Title}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {absence.Professor_Name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer: Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 bg-white"
          >
            Cancel
          </button>
          <button 
            onClick={() => { onExcuse(student.Enrollment_ID, student.Student_Name); onClose(); }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex items-center"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Validate & Excuse
          </button>
          <button 
            onClick={() => { onDrop(student.Enrollment_ID, student.Student_Name, student.Section); onClose(); }}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center"
          >
            <UserMinus className="h-4 w-4 mr-2" />
            Confirm Official Drop
          </button>
        </div>
      </div>
    </div>
  );
}