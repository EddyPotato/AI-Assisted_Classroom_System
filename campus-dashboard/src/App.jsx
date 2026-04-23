import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

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
  const [roomState, setRoomState] = useState('UNLOCKED (Class Ongoing)'); 
  const [occupancy, setOccupancy] = useState(0);
  const [lastScanned, setLastScanned] = useState(null);
  const [eventLogs, setEventLogs] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: 'System Initialized. Awaiting Events.', type: 'system' }
  ]);

  const API_BASE_URL = 'http://localhost:5106/api';
  const HUB_URL = 'http://localhost:5106/campushub';

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
          time: now, 
          message: `AI CAMERA: ${student.first_Name} ${student.last_Name} verified and logged.`, 
          type: 'success' 
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
      if (connection.state === 'Connected') {
        connection.stop();
      }
    };
  }, []);

  const triggerEvent = async (actionType) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newMessage = '';
    let newType = 'info';

    switch(actionType) {
      case 'STUDENT_SCAN':
        if (roomState.includes('LOCKED')) {
          newMessage = 'Failed: Cannot enter. Professor not present.';
          newType = 'error';
        } else {
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
        }
        break;
      default:
        break;
    }

    setEventLogs(prev => [{ time: now, message: newMessage, type: newType }, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <DashboardContent 
          roomState={roomState} 
          occupancy={occupancy} 
          lastScanned={lastScanned} 
        />
        <SimulationPanel 
          triggerEvent={triggerEvent} 
          eventLogs={eventLogs} 
        />
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