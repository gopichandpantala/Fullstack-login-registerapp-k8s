import React from 'react';
import { useLocation } from 'react-router-dom';
import './Login.css';

function Dashboard() {
  const location = useLocation();
  const message = location.state?.message || 'Welcome!';

  return (
    <div className="container">
      <h1 className="dashboard">{message}</h1>
    </div>
  );
}

export default Dashboard;
