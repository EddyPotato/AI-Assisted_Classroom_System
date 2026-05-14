import React from 'react';
import { Users, GraduationCap, Building } from 'lucide-react';

export default function DashboardView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Campus Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900">1,248</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Active Faculty</p>
            <h3 className="text-2xl font-bold text-gray-900">84</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Building className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Active Sections</p>
            <h3 className="text-2xl font-bold text-gray-900">42</h3>
          </div>
        </div>
      </div>
    </div>
  );
}