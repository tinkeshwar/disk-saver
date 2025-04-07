import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import FileList from '../components/FileList';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const handleAuth = (newToken = null) => {
    setToken(newToken);
    newToken ? localStorage.setItem('token', newToken) : localStorage.removeItem('token');
  };

  return (
    <div>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/files" /> : <Login onLogin={handleAuth} />} />
        <Route path="/files" element={token ? <FileList token={token} onLogout={() => handleAuth()} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/files" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
