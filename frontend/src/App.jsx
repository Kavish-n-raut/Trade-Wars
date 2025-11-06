import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import { NewsProvider } from './context/NewsContext';
import theme from './theme';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Portfolio from './components/Portfolio';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import News from './components/News';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#00d9ff',
        fontSize: '20px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Only Route Component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('🚫 Not admin, redirecting to dashboard. User:', user?.username, 'isAdmin:', user?.isAdmin);
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Admin access granted for:', user?.username);
  return children;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Only Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

        {/* Default Route */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } 
        />
        
        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <StockProvider>
          <NewsProvider>
            <AppContent />
          </NewsProvider>
        </StockProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;