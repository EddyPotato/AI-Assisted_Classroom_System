import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';

// Import the views
import FacultyDashboardView from './views/FacultyDashboardView';
import ClassAttendance from './ClassAttendance';

export default function FacultyPortal() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* The Unified Global Header */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* The Unified Global Sidebar configured for Faculty */}
        <Sidebar role="Faculty" />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<FacultyDashboardView />} />
            <Route path="/attendance/:scheduleId?" element={<ClassAttendance />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}