import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import AtRiskTable from './components/AtRiskTable';
import AbsenceDetailsModal from './components/AbsenceDetailsModal';
import { useAtRiskStudents } from './hooks/useAtRiskStudents';

export default function PrincipalPortal() {
  const { 
    atRiskStudents, 
    loading, 
    fetchAtRiskStudents, 
    fetchAbsenceDetails,
    handleExcuse, 
    handleDrop 
  } = useAtRiskStudents();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openReviewModal = async (student) => {
    const details = await fetchAbsenceDetails(student.Enrollment_ID);
    setSelectedStudent({ ...student, absenceDetails: details });
    setIsModalOpen(true);
  };

  return (
    // Changed to flex-col so Header sits on top and spans full width
    <div className="flex flex-col h-screen bg-gray-50">
      
      {/* 1. Header is now the absolute top element */}
      <Header />
      
      {/* 2. Container for Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        <Sidebar role="Principal" />
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Intervention Required</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Students with 3 or more consecutive unexcused absences.</p>
                </div>
              </div>
              <button 
                onClick={fetchAtRiskStudents}
                className="flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
                Refresh List
              </button>
            </div>

            <div className="overflow-x-auto">
              <AtRiskTable 
                atRiskStudents={atRiskStudents}
                loading={loading}
                onReviewReport={openReviewModal}
              />
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && selectedStudent && (
        <AbsenceDetailsModal 
          student={selectedStudent} 
          onClose={() => setIsModalOpen(false)}
          onExcuse={handleExcuse}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
}