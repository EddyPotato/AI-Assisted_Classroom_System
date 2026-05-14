import React from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import { BarChart3 } from 'lucide-react';

export default function AcademicReports() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="Principal" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Academic Reports</h2>
            <p className="text-gray-500">View university-wide attendance and enrollment statistics.</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Reporting Module</h3>
            <p className="text-gray-500 mt-2">Data visualization tools will be populated here.</p>
          </div>
        </main>
      </div>
    </div>
  );
}