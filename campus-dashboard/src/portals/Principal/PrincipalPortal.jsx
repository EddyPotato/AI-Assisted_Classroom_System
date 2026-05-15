import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';

// Import our view components
import DashboardView from './views/DashboardView';
import InterventionsView from './views/InterventionsView';

export default function PrincipalPortal() {
  const location = useLocation();

  // Simple router to switch content based on Sidebar clicks
  const renderView = () => {
    if (location.pathname.includes('/interventions')) return <InterventionsView />;
    return <DashboardView />;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="Principal" />
        <main className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}