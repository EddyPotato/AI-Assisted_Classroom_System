import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Settings } from 'lucide-react';

export default function Sidebar() {
  // Function to apply styles based on whether the route is currently active
  const navStyle = ({ isActive }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isActive 
        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100' 
        : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <nav className="p-4 space-y-2">
        <NavLink to="/dashboard" className={navStyle}>
          <LayoutDashboard size={20} /> Room Dashboard
        </NavLink>
        <NavLink to="/profiles" className={navStyle}>
          <Users size={20} /> Student Profiles
        </NavLink>
        <NavLink to="/logs" className={navStyle}>
          <Clock size={20} /> Attendance Logs
        </NavLink>
        <NavLink to="/settings" className={navStyle}>
          <Settings size={20} /> System Settings
        </NavLink>
      </nav>
    </aside>
  );
}