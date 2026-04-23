import { useState } from 'react';
import { 
  LayoutDashboard, Users, Clock, Settings, 
  Menu, Video, AlertTriangle, UserCheck, User 
} from 'lucide-react';

function App() {
  const [roomState, setRoomState] = useState('LOCKED (Waiting for Professor)');
  const [occupancy, setOccupancy] = useState(0);
  const [lastScanned, setLastScanned] = useState(null);
  const [eventLogs, setEventLogs] = useState([
    { time: '07:45 AM', message: 'System Initialized. Room 302 Locked.', type: 'system' }
  ]);

  // YOUR BACKEND URL (Update the port number to match your dotnet run output)
  const API_BASE_URL = 'http://localhost:5106/api';

  const triggerEvent = async (actionType) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newMessage = '';
    let newType = 'info';

    switch(actionType) {
      case 'PROF_ENTRY':
        setRoomState('UNLOCKED (Class Ongoing)');
        newMessage = 'Professor authenticated. Door unlocked.';
        newType = 'success';
        break;
        
      case 'STUDENT_SCAN':
        if (roomState.includes('LOCKED')) {
          newMessage = 'Failed: Cannot enter. Professor not present.';
          newType = 'error';
        } else {
          try {
            // Making the actual HTTP call to your C# API!
            const response = await fetch(`${API_BASE_URL}/student/24-1507`);
            
            if (response.ok) {
              const student = await response.json();
              setOccupancy(prev => prev + 1);
              setLastScanned(student); // Save data to state to show in UI
              newMessage = `Access Granted: ${student.first_Name} ${student.last_Name} entered.`;
              newType = 'success';
            } else {
              newMessage = 'Alert: Invalid ID Scanned or Not Found.';
              newType = 'error';
            }
          } catch (error) {
            newMessage = 'Network Error: Cannot connect to Oracle Database.';
            newType = 'error';
            console.error(error);
          }
        }
        break;

      case 'UNAUTHORIZED_EXIT':
        if (occupancy > 0) setOccupancy(prev => prev - 1);
        newMessage = 'ALERT: Student exited without scanning barcode! Snapshot saved.';
        newType = 'error';
        setLastScanned(null);
        break;

      case 'BREAK_START':
        newMessage = 'Student requested restroom break. 10-minute timer started.';
        newType = 'warning';
        break;

      default:
        break;
    }

    setEventLogs(prev => [{ time: now, message: newMessage, type: newType }, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      
      {/* TOP HEADER */}
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

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR NAVIGATION */}
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

        {/* CENTER MAIN CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Room 302 Overview</h2>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide border ${
                roomState.includes('LOCKED') 
                  ? 'bg-red-50 text-red-700 border-red-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {roomState}
              </span>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-gray-500 uppercase">Current Occupancy</p>
                <p className="text-4xl font-black text-gray-800 mt-2">{occupancy} <span className="text-lg text-gray-400 font-medium">/ 50</span></p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-orange-500 uppercase">On Break</p>
                <p className="text-4xl font-black text-orange-600 mt-2">0</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-semibold text-rose-500 uppercase">Active Alerts</p>
                <p className="text-4xl font-black text-rose-600 mt-2">0</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Camera Feed Placeholder */}
              <div className="bg-slate-900 rounded-xl overflow-hidden shadow-md aspect-video relative flex items-center justify-center border border-slate-700">
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">REC</span>
                  <span className="bg-black/50 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">DOOR CAM</span>
                </div>
                <div className="text-center">
                  <Video className="mx-auto text-slate-600 mb-3" size={48} />
                  <p className="text-slate-400 font-medium">OpenCV Feed Offline</p>
                </div>
              </div>

              {/* Dynamic Identity Match Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Last Identity Match</h3>
                
                {lastScanned ? (
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                      <User size={40} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">
                        {lastScanned.first_Name} {lastScanned.last_Name}
                      </h4>
                      <p className="text-gray-500 font-mono mt-1 text-sm">ID: {lastScanned.student_ID}</p>
                      <p className="text-xs text-gray-400 mt-2 bg-gray-100 p-2 rounded break-all">
                        Ref: {lastScanned.face_Reference_Path}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <UserCheck size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Waiting for scan event...</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* RIGHT SIDE PANEL: RPG SIMULATION ENGINE */}
        <aside className="w-80 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-l border-slate-800 shadow-2xl z-20">
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck size={20} className="text-blue-400"/> Simulation Engine
            </h3>
            <p className="text-xs text-slate-400 mt-1">Trigger events to test system logic and API routing.</p>
          </div>

          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Professor Scenarios</h4>
              <button onClick={() => triggerEvent('PROF_ENTRY')} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors border border-slate-600">
                Scan Prof. ID (Unlock)
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Scenarios</h4>
              <button onClick={() => triggerEvent('STUDENT_SCAN')} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors border border-blue-800/50 text-left">
                Scan ID Barcode (Enter)
                <span className="block text-xs font-normal opacity-70 mt-1 text-center font-mono">Test ID: 24-1507</span>
              </button>
              <button onClick={() => triggerEvent('BREAK_START')} className="w-full bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors border border-orange-800/50">
                Request Break (Exit)
              </button>
              <button onClick={() => triggerEvent('UNAUTHORIZED_EXIT')} className="w-full bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors border border-rose-800/50">
                Sneak Out (No Scan)
              </button>
            </div>

            {/* Live Event Log */}
            <div className="mt-8">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle size={14} /> Live Action Log
              </h4>
              <div className="space-y-3">
                {eventLogs.map((log, i) => (
                  <div key={i} className="text-sm bg-slate-800/80 p-3 rounded-lg border border-slate-700/50">
                    <span className="text-xs text-slate-500 block mb-1">{log.time}</span>
                    <span className={`font-medium ${
                      log.type === 'error' ? 'text-rose-400' : 
                      log.type === 'success' ? 'text-emerald-400' : 
                      log.type === 'warning' ? 'text-orange-400' : 'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}

export default App;