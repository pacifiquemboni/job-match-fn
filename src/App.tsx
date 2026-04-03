// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Jobs } from './pages/Jobs';
import { JobDetails } from './pages/JobDetails';
import { CreateJob } from './pages/CreateJob';
import { MyApplications } from './pages/MyApplications';
import { Messages } from './pages/Messages';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';

function AppContent() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        
        {/* Protected Routes */}
        <Route
          path="/create-job"
          element={
            <ProtectedRoute allowedRoles={['CLIENT']}>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute allowedRoles={['WORKER']}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={['WORKER', 'CLIENT']}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['WORKER', 'CLIENT']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['WORKER', 'CLIENT']}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;