import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import RegistrationDetails from './pages/RegistrationDetails';

import './App.css';

import { ThemeProvider } from './context/ThemeContext';

const LayoutContent = () => {
  const location = useLocation();
  // Check if current path is a dashboard path
  // Added staff dashboard check
  const isDashboard = location.pathname.startsWith('/student') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/staff');

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0, padding: 0, background: 'var(--bg-body)', color: 'var(--text-main)' }}>
      {!isDashboard && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && <Navbar />}

      <main style={{ flex: 1, width: '100%', margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute requiredRole={['STUDENT']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          {/* Allow students to access sub-routes within dashboard layout context if configured */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute requiredRole={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute requiredRole={['STAFF']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/registration/:id"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <RegistrationDetails />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer logic: Only show global footer on non-dashboard, non-landing pages if needed. 
          Home has its own footer. Login has its own. Register relies on global? 
          Let's keep it simple: */}
      {!isDashboard && location.pathname !== '/' && location.pathname !== '/login' && (
        <footer style={{
          background: 'var(--bg-card)',
          color: 'var(--text-secondary)',
          padding: '2rem 1rem',
          textAlign: 'center',
          marginTop: 'auto',
          width: '100%',
          borderTop: '1px solid var(--border-color)',
        }}>
          <p style={{ margin: 0, opacity: 0.8 }}>
            © {new Date().getFullYear()} LMS Portal. All rights reserved.
          </p>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <LayoutContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
