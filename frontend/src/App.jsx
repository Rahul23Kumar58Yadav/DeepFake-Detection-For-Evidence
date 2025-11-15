import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import AnimationShowcase from './components/AnimationUtils';
import Footer from './components/Footer';
import Home from './components/Home';
import Navbar from "./components/Navbar"
import Profile from './components/Profile';
import AudioDetection from './detections/AudioDetection';
import VideoDetection from './detections/VideoDetection';
import Login from './Authentication/Login';
import Register from './Authentication/Register';
import ForgotPassword from './Authentication/ForgotPassword';
import ProtectedRoute from './Authentication/ProtectedRoute';
import DeepFakeDebugger from './detections/DeepFakeDebugger';

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return !token ? children : <Navigate to="/" replace />;
};

// Layout Component with Navbar and Footer
const Layout = ({ children, showNavbar = true, showFooter = true }) => {
  return (
    <div style={styles.layoutContainer}>
      {showNavbar && <Navbar />}
      <main style={styles.mainContent}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider> {/* Add AuthProvider wrapper */}
      <Router>
        <div style={styles.appContainer}>
          <Routes>
            {/* Public Routes with Layout */}
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />

            {/* Authentication Routes (without navbar/footer) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Layout showNavbar={false} showFooter={false}>
                    <Login />
                  </Layout>
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Layout showNavbar={false} showFooter={false}>
                    <Register />
                  </Layout>
                </PublicRoute>
              }
            />

            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <Layout showNavbar={false} showFooter={false}>
                    <ForgotPassword />
                  </Layout>
                </PublicRoute>
              }
            />

            {/* Protected Detection Routes */}
            <Route
              path="/audio"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AudioDetection />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/video"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VideoDetection />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Protected Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Utility Routes */}
            <Route
              path="/animations"
              element={
                <Layout>
                  <AnimationShowcase />
                </Layout>
              }
            />
   <Route
              path="/debug"
              element={
                <Layout>
                  <DeepFakeDebugger />
                </Layout>
              }
            />
            {/* 404 Not Found Route */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFound />
                </Layout>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// 404 Not Found Component
const NotFound = () => {
  return (
    <div style={styles.notFoundContainer}>
      <div style={styles.notFoundContent}>
        <h1 style={styles.notFoundTitle}>404</h1>
        <h2 style={styles.notFoundSubtitle}>Page Not Found</h2>
        <p style={styles.notFoundText}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" style={styles.notFoundButton}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

// Styles (keep your existing styles)
const styles = {
  appContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e3a8a20, #0f172a)',
  },
  layoutContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  mainContent: {
    flex: 1,
  },
  notFoundContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
    padding: '2rem',
  },
  notFoundContent: {
    textAlign: 'center',
    color: 'white',
  },
  notFoundTitle: {
    fontSize: 'clamp(4rem, 15vw, 8rem)',
    fontWeight: 'bold',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
  },
  notFoundSubtitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  notFoundText: {
    fontSize: '1.125rem',
    color: '#9ca3af',
    marginBottom: '2rem',
  },
  notFoundButton: {
    display: 'inline-block',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
    transition: 'transform 0.2s',
  },
};

export default App;