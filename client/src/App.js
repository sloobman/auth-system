import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isAuthenticated ? (
            <Navigate to="/profile" />
          ) : (
            <LoginPage 
              onLogin={() => setIsAuthenticated(true)} 
              theme={theme}
              toggleTheme={toggleTheme}
            />
          )
        } />
        <Route path="/profile" element={
          isAuthenticated ? (
            <ProfilePage 
              onLogout={() => setIsAuthenticated(false)}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          ) : (
            <Navigate to="/" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;