//ProviderLogin.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { PROVIDER_LOGIN } from '../../graphql/mutations';
import '../CSScomponents/Login.css';

const ProviderLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false); // State to show/hide button
  const navigate = useNavigate();
  const [providerLogin] = useMutation(PROVIDER_LOGIN);

  useEffect(() => {
    // Prevent forward navigation after logout
    navigate('.', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowForgotPassword(false); // Hide button on new attempts

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      console.log('Attempting to log in with:', { username, password });
      const { data } = await providerLogin({ variables: { username, password } });
      console.log('Mutation result:', data);

      if (data.providerLogin.token) {
        console.log('Token received:', data.providerLogin.token);
        localStorage.setItem('token', data.providerLogin.token);
        localStorage.setItem('userRole', 'provider');
        navigate('/provider-home', { replace: true });
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('Invalid username or password. Please try again.');
      setShowForgotPassword(true); // Show "Forgot Password?" button
    }
  };

  return (
    <div className="login-container">
      <nav>
        <ul className="nav-links">
          <li><Link to="/" className="home-link">Home</Link></li>
        </ul>
      </nav>
      <div className="image-container">
        <img src="/Symbol.jpeg" alt="Symbol" className="top-image" />
      </div>
      <h1>Disbursement Provider Log In</h1>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">Login</button>

        {/* Show "Forgot Password?" button if login fails */}
        {showForgotPassword && (
          <button
            type="button"
            className="forgot-password-button"
            onClick={() => {
              navigate('/provider-forgot-password');
            }}
            
          >
            Forgot Password?
          </button>
        )}
      </form>
    </div>
  );
};

export default ProviderLogin;

