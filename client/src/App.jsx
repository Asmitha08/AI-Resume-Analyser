import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <div className="app">
        <nav className="nav-bar">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="nav-logo">AI Resume Analyzer</div>
          </Link>
          <div>
            {user ? (
              <button className="btn" onClick={logout} style={{ background: 'var(--danger-color)' }}>Logout</button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/login" className="btn" style={{ background: 'transparent', border: '1px solid var(--primary-color)' }}>Login</Link>
                <Link to="/register" className="btn">Register</Link>
              </div>
            )}
          </div>
        </nav>

        <main className="container">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/upload" element={
              <PrivateRoute>
                <UploadResume />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
