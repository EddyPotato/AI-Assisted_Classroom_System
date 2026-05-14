import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import AtRiskTable from './components/AtRiskTable';
import { useAtRiskStudents } from './hooks/useAtRiskStudents';

export default function PrincipalPortal() {
  const { 
    atRiskStudents, 
    loading, 
    fetchAtRiskStudents, 
    handleExcuse, 
    handleDrop 
  } = useAtRiskStudents();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="Principal" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Principal Dashboard - Intervention Required" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-red-50">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-800">Unofficially Dropped Students (3+ Absences)</h2>
              </div>
              <button 
                onClick={fetchAtRiskStudents}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
                Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <AtRiskTable 
                atRiskStudents={atRiskStudents}
                loading={loading}
                handleExcuse={handleExcuse}
                handleDrop={handleDrop}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}