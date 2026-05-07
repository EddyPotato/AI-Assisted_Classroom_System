import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & UI Components
import Header from './components/ui/Header';
import Sidebar from './components/ui/Sidebar';
import Login from './components/auth/Login';

// NEW Faculty Portals
import FacultyDashboard from './portals/Faculty/FacultyDashboard';
import ClassAttendance from './portals/Faculty/ClassAttendance';

// Role-Specific Portals
import GuardPortal from './portals/Guard/GuardPortal';
import RegistrarPortal from './portals/Registrar/RegistrarPortal';
import PrincipalPortal from './portals/Principal/PrincipalPortal';

function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('campus_user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// --- MASTER LAYOUT & LOGIC (FACULTY VIEW) ---
function CampusLayout() {
  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<FacultyDashboard />} />
          <Route path="/class/:scheduleId" element={<ClassAttendance />} />
        </Routes>
      </div>
    </div>
  );
}

// --- THE ROLE ROUTER ---
function RoleDispatcher() {
  const userString = sessionStorage.getItem('campus_user');
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedRoute><RoleDispatcher /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}