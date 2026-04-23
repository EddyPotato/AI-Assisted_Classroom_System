import { Menu } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-3">
        <Menu className="text-gray-500 cursor-pointer hover:text-gray-800" size={24} />
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">AI Smart Campus System</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Local Network Mode</span>
        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          Admin
        </div>
      </div>
    </header>
  );
}