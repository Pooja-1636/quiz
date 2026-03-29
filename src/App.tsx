import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import CoursesPage from './pages/CoursesPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import ProgressPage from './pages/ProgressPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageCourses from './pages/ManageCourses';
import ManageQuestions from './pages/ManageQuestions';
import UserMonitoring from './pages/UserMonitoring';
import { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {/* User Routes */}
        {user.role === 'user' && (
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/dashboard" element={<UserDashboard user={user} />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}

        {/* Admin Routes */}
        {user.role === 'admin' && (
          <Route element={<Layout user={user} onLogout={handleLogout} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/questions" element={<ManageQuestions />} />
            <Route path="/admin/users" element={<UserMonitoring />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        )}

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={user.role === 'admin' ? "/admin/dashboard" : "/dashboard"} replace />} />
      </Routes>
    </Router>
  );
}
