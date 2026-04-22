import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AttendancePage from './pages/AttendancePage';
import GroupChatPage from './pages/GroupChatPage';
import ProfilePage from './pages/ProfilePage';
import LeavePage from './pages/LeavePage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import Sidebar from './components/Sidebar';

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'var(--lavender)', color: 'var(--accent)',
          fontSize: '1.5rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>A</div>
        <svg className="spin-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    </div>
  );
}

function ProtectedLayout({ children }) {
  const { currentUser, authLoading } = useApp();
  if (authLoading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function AppRoutes() {
  const { currentUser, authLoading } = useApp();

  if (authLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
      <Route path="/attendance" element={<ProtectedLayout><AttendancePage /></ProtectedLayout>} />
      <Route path="/attendance/manage" element={<ProtectedLayout><AdminAttendancePage /></ProtectedLayout>} />
      <Route path="/chat" element={<ProtectedLayout><GroupChatPage /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      <Route path="/leaves" element={<ProtectedLayout><LeavePage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
