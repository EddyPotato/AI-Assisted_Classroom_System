import React from 'react';
import { LayoutDashboard, Users, BookOpen, UserCheck, ShieldAlert, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavLinks = () => {
    switch (role) {
      case 'Principal':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/principal' },
          { name: 'Interventions', icon: ShieldAlert, path: '/principal/interventions' },
          { name: 'Faculty Oversight', icon: UserCheck, path: '/principal/faculty' },
        ];
      case 'Registrar':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/registrar' },
          { name: 'Sections', icon: Users, path: '/registrar/sections' },
          { name: 'Schedules', icon: BookOpen, path: '/registrar/schedules' },
          { name: 'Directories', icon: UserCheck, path: '/registrar/users' },
        ];
      case 'Faculty':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/faculty' },
          { name: 'My Classes', icon: BookOpen, path: '/faculty/classes' },
          { name: 'Attendance', icon: UserCheck, path: '/faculty/attendance' },
        ];
      case 'Guard':
        return [
          { name: 'Live Monitor', icon: LayoutDashboard, path: '/guard' },
          { name: 'Access History', icon: ShieldAlert, path: '/guard/history' },
        ];
      case 'SystemAdmin':
        return [
          { name: 'System Status', icon: LayoutDashboard, path: '/admin' },
          { name: 'Camera Config', icon: Settings, path: '/admin/cameras' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-64 bg-white text-gray-800 border-r border-gray-200 h-full flex flex-col shadow-sm z-20 shrink-0">
      <nav className="flex-1 mt-6 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {getNavLinks().map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (location.pathname === '/' && link.name === 'Dashboard');
            return (
              <li key={link.name}>
                <button
                  onClick={() => navigate(link.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600 font-medium'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{link.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}