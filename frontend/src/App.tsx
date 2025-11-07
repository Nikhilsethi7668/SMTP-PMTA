import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './store/useAuthStore';
import SignUpPage from './pages/SignUpPage';
import EmailVerify from './pages/EmailVerify';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <HashRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/verify-email" element={<EmailVerify/>} />
        
        {/* Dashboard and subroutes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
