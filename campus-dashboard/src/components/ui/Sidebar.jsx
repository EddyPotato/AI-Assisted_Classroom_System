import React from 'react';
import { LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavLinks = () => {
    // Only returning Principal links as an example, add your others back if needed
    if (role === 'Principal') {
      return [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/principal' },
        { name: 'Student Interventions', icon: ShieldAlert, path: '/principal/interventions' },
      ];
    }
    return [];
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