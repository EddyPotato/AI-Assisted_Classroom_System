import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Layout & UI Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SimulationPanel from './components/SimulationPanel';
import Login from './components/Login';

// Functional Pages (Faculty/Admin Shared)
import RoomDashboard from './components/RoomDashboard';
import StudentProfiles from './components/StudentProfiles';
import AttendanceLogs from './components/AttendanceLogs';
import SystemSettings from './components/SystemSettings';

// Role-Specific Portals
import GuardPortal from './components/GuardPortal';
import RegistrarPortal from './components/RegistrarPortal';
import PrincipalPortal from './components/PrincipalPortal';

// --- STRICT ROUTING GUARD ---
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('campus_user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// --- MASTER LAYOUT & LOGIC (FACULTY VIEW) ---
function CampusLayout() {
  // Removed setRoomState to fix ESLint warning
  const [roomState] = useState('UNLOCKED (Class Ongoing)'); 
  const [occupancy, setOccupancy] = useState(0);
  const [lastScanned, setLastScanned] = useState(null);
  const [presentStudents, setPresentStudents] = useState([]); 
  const [eventLogs, setEventLogs] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: 'System Initialized. Awaiting Events.', type: 'system' }
  ]);

  const API_BASE_URL = 'http://localhost:5106/api';
  const HUB_URL = 'http://localhost:5106/campushub';

  // Real-Time SignalR Connection
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
        
        setPresentStudents(prev => 
          !prev.includes(student.student_ID) ? [...prev, student.student_ID] : prev
        );

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

    if (actionType === 'STUDENT_SCAN') {
      try {
        const response = await fetch(`${API_BASE_URL}/student/24-1507`);
        if (response.ok) {
          const student = await response.json();
          setOccupancy(prev => prev + 1);
          setLastScanned(student);
          
          setPresentStudents(prev => 
            !prev.includes(student.student_ID) ? [...prev, student.student_ID] : prev
          );

          newMessage = `Manual Override: Access Granted for ${student.first_Name}.`;
          newType = 'success';
        }
      } catch { // Removed the unused 'error' variable here to fix ESLint warning
        newMessage = 'Network Error: Cannot connect to API.';
        newType = 'error';
      }
    }
    setEventLogs(prev => [{ time: now, message: newMessage, type: newType }, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<RoomDashboard roomState={roomState} occupancy={occupancy} lastScanned={lastScanned} />} />
          <Route path="/profiles" element={<StudentProfiles presentStudents={presentStudents} />} />
          <Route path="/logs" element={<AttendanceLogs eventLogs={eventLogs} />} />
          <Route path="/settings" element={<SystemSettings />} />
        </Routes>

        <SimulationPanel triggerEvent={triggerEvent} eventLogs={eventLogs} />
      </div>
    </div>
  );
}

// --- THE ROLE ROUTER ---
function RoleDispatcher() {
  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" replace />;

  // THE FIX: Check for user.role (lowercase 'r') because of C# JSON serialization
  const userRole = user.role || user.Role; 

  switch (userRole) {
    case 'Faculty':
      return <CampusLayout />;
    case 'Guard':
      return <GuardPortal />;
    case 'Registrar':
      return <RegistrarPortal />;
    case 'Principal':
    case 'Admin':
      return <PrincipalPortal />;
    default:
      return <Navigate to="/login" replace />;
  }
}

// --- MASTER ROUTER ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <RoleDispatcher />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}