import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CodingPractice from './pages/CodingPractice';
import AptitudeSection from './pages/AptitudeSection';
import MockTest from './pages/MockTest';
import ResumeBuilder from './pages/ResumeBuilder';
import CompanyPrep from './pages/CompanyPrep';
import NotesLibrary from './pages/NotesLibrary';
import Profile from './pages/Profile';
import CommunityChat from './pages/CommunityChat';
import ResourcesHub from './pages/ResourcesHub';
import BuildTogether from './pages/BuildTogether';

// Layouts
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Context
import { AuthProvider, AuthContext } from './context/AuthContext';
// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityChat /></ProtectedRoute>} />
            <Route path="/coding" element={<ProtectedRoute><CodingPractice /></ProtectedRoute>} />
            <Route path="/aptitude" element={<ProtectedRoute><AptitudeSection /></ProtectedRoute>} />
            <Route path="/mock-test" element={<ProtectedRoute><MockTest /></ProtectedRoute>} />
            <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path="/company-prep" element={<ProtectedRoute><CompanyPrep /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotesLibrary /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><ResourcesHub /></ProtectedRoute>} />
            <Route path="/build-together" element={<ProtectedRoute><BuildTogether /></ProtectedRoute>} />
          </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
