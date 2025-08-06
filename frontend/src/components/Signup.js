import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupStatus, setSignupStatus] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (res.ok && data.username) {
      navigate('/dashboard', {
        state: { message: `Account created successfully` }
      });
    } else {
      setSignupStatus('error');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2>Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleSignup}>SIGN UP</button>
        {signupStatus === 'error' && <p className="error">Signup failed</p>}
        <a href="/login">Login</a>
      </div>
    </div>
  );
}

export default Signup;
