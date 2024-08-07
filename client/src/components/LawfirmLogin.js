import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import './Login.css'; // Assuming you have a CSS file for styling

const LawfirmLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
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
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">Login</button>
      </form>
    </div>
  );
};

export default LawfirmLogin;
