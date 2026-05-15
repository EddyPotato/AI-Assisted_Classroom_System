import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import Login from './components/auth/Login';

// Import all of your Portals
import FacultyPortal from './portals/Faculty/FacultyPortal';
import PrincipalPortal from './portals/Principal/PrincipalPortal';
// import GuardPortal from './portals/Guard/GuardPortal';
// import RegistrarPortal from './portals/Registrar/RegistrarPortal';
// import SystemAdminPortal from './portals/SystemAdmin/SystemAdminPortal'; 

// Authentication Wrapper
function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem('campus_user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Role-based redirect logic
function RoleRedirect() {
  const userString = sessionStorage.getItem('campus_user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role || user.Role; 
  switch (userRole) {
    case 'Faculty':
      return <Navigate to="/faculty" replace />;
    case 'Principal':
      return <Navigate to="/principal" replace />;
    case 'Guard':
      return <Navigate to="/guard" replace />;
    case 'Registrar':
      return <Navigate to="/registrar" replace />;
    case 'SystemAdmin': 
    case 'Admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC ROUTE */}
        <Route path="/login" element={<Login />} />
        
        {/* BASE ROUTE (Auto-redirects based on Role) */}
        <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

        {/* PORTAL ROUTES (The /* allows the Portals to handle their own internal navigation) */}
        <Route path="/faculty/*" element={<ProtectedRoute><FacultyPortal /></ProtectedRoute>} />
        <Route path="/principal/*" element={<ProtectedRoute><PrincipalPortal /></ProtectedRoute>} />
        
        {/* Uncomment these when you add the wrappers for the others */}
        {/* <Route path="/guard/*" element={<ProtectedRoute><GuardPortal /></ProtectedRoute>} /> */}
        {/* <Route path="/registrar/*" element={<ProtectedRoute><RegistrarPortal /></ProtectedRoute>} /> */}
        {/* <Route path="/admin/*" element={<ProtectedRoute><SystemAdminPortal /></ProtectedRoute>} /> */}

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}