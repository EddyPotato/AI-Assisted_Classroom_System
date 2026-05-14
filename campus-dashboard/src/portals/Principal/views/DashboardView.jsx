import React from 'react';
import { Users, UserCheck, Activity, ShieldAlert, TrendingUp, ChevronRight, Clock } from 'lucide-react';

export default function DashboardView() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Campus Overview</h2>
      
      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Campus Occupancy (Replaces Active Sections) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Users className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Campus Occupancy</p>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <h3 className="text-2xl font-black text-gray-900">842</h3>
              <span className="text-sm text-gray-500 font-semibold">/ 1,248 Students</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mt-2 border border-gray-200">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '67%' }}></div>
            </div>
          </div>
        </div>

        {/* 2. Active Faculty */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <UserCheck className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Active Faculty</p>
            <h3 className="text-2xl font-black text-gray-900">84</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">Clocked in today</p>
          </div>
        </div>

        {/* 3. NEW: Daily Attendance Rate */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <TrendingUp className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wide">Daily Attendance</p>
            <h3 className="text-2xl font-black text-gray-900">92.4%</h3>
            <p className="text-xs text-green-600 font-bold mt-1 flex items-center">
              ↑ +1.2% from yesterday
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM PANELS (NEW USEFUL COMPONENTS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Panel A: Action Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
           <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="text-base font-bold text-gray-900 flex items-center">
               <ShieldAlert className="h-5 w-5 mr-2 text-orange-500" />
               Pending Interventions
             </h3>
             <button className="text-sm text-indigo-600 font-bold hover:text-indigo-800">View All</button>
           </div>
           <div className="p-5 flex-1 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Review 3+ Absences</p>
                  <p className="text-xs text-gray-500">12 students flagged for unofficial dropping</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Faculty Tardiness</p>
                  <p className="text-xs text-gray-500">2 professors flagged for review</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
           </div>
        </div>

        {/* Panel B: Live Gate Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
           <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="text-base font-bold text-gray-900 flex items-center">
               <Activity className="h-5 w-5 mr-2 text-blue-500" />
               Live Gate Activity
             </h3>
             <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
             </span>
           </div>
           <div className="p-5 flex-1 space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Access Granted: Maria Santos</p>
                  <p className="text-xs text-gray-500">Main Gate • Just now</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Access Granted: Prof. Olayon</p>
                  <p className="text-xs text-gray-500">Main Gate • 2 mins ago</p>
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}