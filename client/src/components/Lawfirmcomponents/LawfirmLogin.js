// src/components/LawfirmLogin.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux'; // Import useDispatch
import { LAW_FIRM_LOGIN } from '../../graphql/mutations';
import { setLawFirmId, setUserId, setUsername, setEmail } from '../../redux/slices/userSlice'; // Import actions
import '../CSScomponents/Login.css';

const LawfirmLogin = () => {
  const [username, setUsernameInput] = useState(''); // Renamed to avoid conflict with setUsername action
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize dispatch
  const [lawFirmLogin] = useMutation(LAW_FIRM_LOGIN);

  useEffect(() => {
    navigate('.', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      console.log('Attempting to log in with:', { username, password });
      const { data } = await lawFirmLogin({ variables: { username, password } });
      console.log('Mutation result:', data);

      if (data && data.lawFirmLogin && data.lawFirmLogin.token) {
        console.log('Token and lawFirmId received:', data.lawFirmLogin.token, data.lawFirmLogin.user.id);

        // Store user data in Redux
        dispatch(setLawFirmId(data.lawFirmLogin.user.id));
        dispatch(setUserId(data.lawFirmLogin.user.id));
        dispatch(setUsername(data.lawFirmLogin.user.username));
        dispatch(setEmail(data.lawFirmLogin.user.email));

        // Optionally, store token in localStorage if needed
        localStorage.setItem('token', data.lawFirmLogin.token);

        navigate('/lawfirm-home', { replace: true });
      } else {
        console.error('Login failed: Token not found in the mutation response');
        setError('Login failed: No token received');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError(err.message);
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
      <h1>Law Firm Log In</h1>
      <form onSubmit={handleSubmit} className="login-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsernameInput(e.target.value)} // Use setUsernameInput
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
      </form>
    </div>
  );
};

export default LawfirmLogin;
