import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ onLogout, theme, toggleTheme }) => {
  const [userData, setUserData] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:3001/profile', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        
        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        onLogout();
        navigate('/');
      }
    };
    
    fetchProfile();
  }, [navigate, onLogout]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/logout', {
        method: 'POST',
        credentials: 'include'
      });
      onLogout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/data', {
        credentials: 'include'
      });
      const data = await response.json();
      setApiData(data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`profile-container ${theme}`}>
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      
      <h1>Profile</h1>
      
      {userData && (
        <div className="user-info">
          <p>Welcome, <strong>{userData.username}</strong>!</p>
        </div>
      )}
      
      <div className="data-section">
        <h2>API Data</h2>
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
        
        {apiData && (
          <div className="data-display">
            <p>Generated at: {new Date(apiData.generatedAt).toLocaleString()}</p>
            <ul>
              {apiData.items.map(item => (
                <li key={item.id}>
                  {item.id}: {item.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;