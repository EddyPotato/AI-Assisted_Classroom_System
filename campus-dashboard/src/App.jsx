import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

// Layout & UI Components
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';
import Login from './components/auth/Login';

// Functional Pages (Faculty/Admin Shared)
import RoomDashboard from './portals/Faculty/views/RoomDashboard';
import StudentProfiles from './portals/Faculty/views/StudentProfiles';
import AttendanceLogs from './portals/Faculty/views/AttendanceLogs';
import SystemSettings from './portals/Faculty/views/SystemSettings';

// Role-Specific Portals
import GuardPortal from './portals/Guard/GuardPortal';
import RegistrarPortal from './portals/Registrar/RegistrarPortal';
import PrincipalPortal from './portals/Principal/PrincipalPortal';

// --- STRICT ROUTING GUARD ---
function ProtectedRoute({ children }) {
  const user = localStorage.getItem('campus_user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// --- MASTER LAYOUT & LOGIC (FACULTY VIEW) ---
function CampusLayout() {
  const [roomState] = useState('UNLOCKED (Class Ongoing)'); 
  const [occupancy, setOccupancy] = useState(0);
  const [lastScanned, setLastScanned] = useState(null);
  const [presentStudents, setPresentStudents] = useState([]); 

  const [eventLogs, setEventLogs] = useState([
    { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), message: 'System Initialized. Awaiting Events.', type: 'system' }
  ]);

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
          if (isMounted) console.log("Connected to SignalR Hub successfully!");
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
      </div>
    </div>
  );
}

// --- THE ROLE ROUTER ---
function RoleDispatcher() {
  const userString = localStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" replace />;

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