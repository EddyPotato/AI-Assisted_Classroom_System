import React from 'react';
import Header from '../../../components/ui/Header';
import Sidebar from '../../../components/ui/Sidebar';
import { Users } from 'lucide-react';

export default function FacultyOversight() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="Principal" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Faculty Oversight</h2>
            <p className="text-gray-500">Monitor professor schedules, class assignments, and campus presence.</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Faculty Directory</h3>
            <p className="text-gray-500 mt-2">Professor evaluations and workload distribution will be managed here.</p>
          </div>
        </main>
      </div>
    </div>
  );
}