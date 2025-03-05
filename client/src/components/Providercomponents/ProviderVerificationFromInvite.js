// client/src/components/Providercomponents/ProviderVerificationFromInvite.js

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // To extract verification token from URL
import { useMutation } from '@apollo/client';
import { COMPLETE_PROVIDER_PROFILE } from '../../graphql/mutations'; // Import the mutation

const ProviderVerificationFromInvite = () => {
  const [username, setUsername] = useState('');
  const [disbFirm, setDisbFirm] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationToken, setVerificationToken] = useState(null); // For storing token

  const [completeProfile, { data, loading, error }] = useMutation(COMPLETE_PROVIDER_PROFILE);

  const location = useLocation(); // To access the verification token in the URL

  // Extract token from URL when the component loads
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      setVerificationToken(token);
    }
  }, [location]);

  const validateUsername = (username) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    return username.length >= minLength && hasNumber.test(username) && hasLetter.test(username);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    return password.length >= minLength && hasNumber.test(password) && hasLetter.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!username) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(username)) {
      newErrors.username = 'Username must be at least 8 characters long, and include both letters and numbers';
    }

    if (!disbFirm) {
      newErrors.disbFirm = 'Disbursement Provider name is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long, and include both letters and numbers';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        console.log("Submitting with variables:", { username, disbFirm, password, verificationToken });
        const response = await completeProfile({
          variables: {
            verificationToken,
            username,
            disbFirm,
            password
          }
        });
        console.log('Form submitted:', response.data);
        setSuccessMessage('Successfully completed profile!');
        // Reset form fields
        setUsername('');
        setDisbFirm('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
      } catch (error) {
        console.error('Sign-up error:', error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          submit: error.message,
        }));
      }
    }
  };

  return (
    <div className="signup-container">
      <h1>Complete Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter new username"
            required
          />
          {errors.username && <p className="error-message">{errors.username}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="disbFirm">Disbursement Provider Name</label>
          <input
            type="text"
            id="disbFirm"
            value={disbFirm}
            onChange={(e) => setDisbFirm(e.target.value)}
            placeholder="Confirm your firm name"
            required
          />
          {errors.disbFirm && <p className="error-message">{errors.disbFirm}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-button">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-button"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="input-with-button">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="toggle-button"
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
        </div>
        <button type="submit" className="submit-button">Complete Profile</button>
      </form>
      {loading && <p>Loading...</p>}
      {errors.submit && <p className="error-message">Error: {errors.submit}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {data && <p className="success-message">Profile completed successfully!</p>}
    </div>
  );
};

export default ProviderVerificationFromInvite;
