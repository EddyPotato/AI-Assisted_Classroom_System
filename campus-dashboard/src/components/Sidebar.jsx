import { LayoutDashboard, Users, Clock, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col md:flex shrink-0">
      <nav className="p-4 space-y-2">
        <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-semibold transition-colors">
          <LayoutDashboard size={20} /> Room Dashboard
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
          <Users size={20} /> Student Profiles
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
          <Clock size={20} /> Attendance Logs
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
          <Settings size={20} /> System Settings
        </a>
      </nav>
    </aside>
  );
}