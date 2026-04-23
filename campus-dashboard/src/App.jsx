import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Import our modular components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardContent from './components/DashboardContent';
import SimulationPanel from './components/SimulationPanel';
import Login from './components/Login';

// --- STRICT ROUTING GUARD ---
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('campus_user');
  if (!user) {
    return <Navigate to="/login" replace />; // Kick back to login if no session exists
  }
  return children;
}

// --- EXTRACTED DASHBOARD LOGIC ---
function DashboardLayout() {
  const [selectedRoom, setSelectedRoom] = useState(null); // Controls Hierarchical View
  const [roomState, setRoomState] = useState('UNLOCKED (Class Ongoing)'); 
  const [occupancy, setOccupancy] = useState(0);
  const [lastScanned, setLastScanned] = useState(null);
  const [eventLogs, setEventLogs] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: 'System Initialized. Awaiting Events.', type: 'system' }
  ]);

  const API_BASE_URL = 'http://localhost:5106/api';
  const HUB_URL = 'http://localhost:5106/campushub';

  // Dummy data for the Room Grid
  const facilities = [
    { id: '302', name: 'Room 302', type: 'Computer Laboratory', capacity: 50, status: 'Active' },
    { id: '303', name: 'Room 303', type: 'Lecture Hall', capacity: 40, status: 'Inactive' },
    { id: '304', name: 'Room 304', type: 'Cisco Networking Lab', capacity: 30, status: 'Active' },
  ];

  useEffect(() => {
    let isMounted = true;
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on("ReceiveScanEvent", (student) => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (isMounted) {
        setLastScanned(student);
        setOccupancy(prev => prev + 1);
        setEventLogs(prev => [{ 
          time: now, message: `AI CAMERA: ${student.first_Name} ${student.last_Name} verified and logged.`, type: 'success' 
        }, ...prev]);
      }
    });

    const startSignalR = async () => {
      try {
        if (connection.state === 'Disconnected') {
          await connection.start();
          if (isMounted) console.log("Connected to SignalR Hub successfully! 🚀");
        }
      } catch (err) {
        if (isMounted) console.error("SignalR Connection Error: ", err);
      }
    };
    
    startSignalR();

    return () => {
      isMounted = false;
      if (connection.state === 'Connected') connection.stop();
    };
  }, []);

  const triggerEvent = async (actionType) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newMessage = '';
    let newType = 'info';

    switch(actionType) {
      case 'STUDENT_SCAN':
        try {
          const response = await fetch(`${API_BASE_URL}/student/24-1507`);
          if (response.ok) {
            const student = await response.json();
            setOccupancy(prev => prev + 1);
            setLastScanned(student);
            newMessage = `Manual Override: Access Granted for ${student.first_Name}.`;
            newType = 'success';
          }
        } catch (error) {
          newMessage = 'Network Error: Cannot connect to API.';
          newType = 'error';
        }
        break;
      default: break;
    }
    setEventLogs(prev => [{ time: now, message: newMessage, type: newType }, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        {/* VIEW ROUTER: Shows Grid OR the Specific Room */}
        {!selectedRoom ? (
          <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-black text-gray-800 tracking-tight">Campus Facilities</h2>
              <p className="text-gray-500 mt-2 font-medium">Select a room to monitor live occupancy and edge node camera feeds.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {facilities.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoom(room.name)}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-black text-gray-800 group-hover:text-blue-600 transition-colors">{room.name}</h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg ${room.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500'}`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-gray-50">
                      <p className="text-sm font-bold text-gray-500 flex items-center justify-between">
                        <span>Type:</span> <span className="text-gray-800">{room.type}</span>
                      </p>
                      <p className="text-sm font-bold text-gray-500 flex items-center justify-between">
                        <span>Capacity:</span> <span className="text-gray-800">{room.capacity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        ) : (
          <DashboardContent 
            roomName={selectedRoom}
            roomState={roomState} 
            occupancy={occupancy} 
            lastScanned={lastScanned} 
            onBack={() => setSelectedRoom(null)} // Allows going back to Grid
          />
        )}

        <SimulationPanel triggerEvent={triggerEvent} eventLogs={eventLogs} />
      </div>
    </div>
  );
}

// --- MASTER ROUTER ---
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;