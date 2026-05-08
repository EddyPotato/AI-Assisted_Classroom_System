import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import Login from './components/auth/Login';

// Faculty Portals
import FacultyDashboard from './portals/Faculty/FacultyDashboard';
import ClassAttendance from './portals/Faculty/ClassAttendance';

// Role-Specific Portals
import GuardPortal from './portals/Guard/GuardPortal';
import RegistrarPortal from './portals/Registrar/RegistrarPortal';
import PrincipalPortal from './portals/Principal/PrincipalPortal';
import SystemAdminPortal from './portals/SystemAdmin/SystemAdminPortal'; 

function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('campus_user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// --- MASTER LAYOUT & LOGIC (FACULTY VIEW) ---
// THE FIX: Removed <Header /> and <Sidebar /> wrappers. 
// The faculty views now contain their own built-in top navigation headers
// and manage their own full-screen layouts.
function CampusLayout() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<FacultyDashboard />} />
      <Route path="/class/:scheduleId" element={<ClassAttendance />} />
    </Routes>
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
      return <PrincipalPortal />;
    case 'SystemAdmin': 
    case 'Admin':
      return <SystemAdminPortal />;
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