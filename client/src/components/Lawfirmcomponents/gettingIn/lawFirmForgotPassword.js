//src/components/Lawfirmcomponents/gettingIn/lawFirmForgotPassword.js

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LAW_FIRM_REQUEST_PASSWORD_RESET } from "../../../graphql/mutations"; // Adjust path if needed
import { Link } from 'react-router-dom';
import '../../CSScomponents/Login.css';

const LawFirmForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [requestPasswordReset] = useMutation(LAW_FIRM_REQUEST_PASSWORD_RESET);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }

    try {
      const { data } = await requestPasswordReset({ variables: { email } });
      setMessage(data.lawFirmRequestPasswordReset.message);
    } catch (err) {
      setError('Error sending password reset request. Please try again.');
      console.error('Reset password error:', err);
    }
  };

  return (
    <div className="login-container">
      <h1>Forgot Password?</h1>
      <p>Enter your email to receive a password reset link.</p>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="submit-button">Send Reset Link</button>
      </form>

      <p>
        <Link to="/lawfirm-login" className="back-to-login">Back to Login</Link>
      </p>
    </div>
  );
};

export default LawFirmForgotPassword;
