//ProviderSignUp.js
import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { PROVIDER_SIGN_UP } from '../../graphql/mutations';
import '../CSScomponents/SignUp.css'; // Assuming you have a CSS file for styling

const ProviderSignUp = () => {
  const [username, setUsername] = useState('');
  const [disbFirm, setDisbFirm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [providerSignUp, { data, loading, error }] = useMutation(PROVIDER_SIGN_UP);

  const usernameRef = useRef(null);
  const disbFirmRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address. Please use the main company email or an email address accessible by senior members of the company.';
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
        console.log("Submitting with variables:", { username, disbFirm, email, password });
        const response = await providerSignUp({ variables: { username, disbFirm, email, password } });
        console.log('Form submitted:', response.data);
        setSuccessMessage('Successfully signed up!');
        // Reset form fields
        setUsername('');
        setDisbFirm('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
      } catch (error) {
        console.error('Sign-up error:', error);
        if (error.message.includes('Username or email already exists')) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            submit: 'Username or email already exists',
          }));
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            submit: error.message,
          }));
        }
      }
    }
  };

  const handleFocus = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop - 10, // Adjust offset as needed
      behavior: 'smooth',
    });
  };

  return (
    <div className="signup-container">
      <h1>Provider - Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            ref={usernameRef}
            onFocus={() => handleFocus(usernameRef)}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <p className="error-message">{errors.username}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="disbFirm">Disb Provider Name</label>
          <input
            type="text"
            id="disbFirm"
            value={disbFirm}
            ref={disbFirmRef}
            onFocus={() => handleFocus(disbFirmRef)}
            onChange={(e) => setDisbFirm(e.target.value)}
          />
          {errors.disbFirm && <p className="error-message">{errors.disbFirm}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="e.g., yourname@company.com"
            value={email}
            ref={emailRef}
            onFocus={() => handleFocus(emailRef)}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}
          <small>Please use the main company email or an email address accessible by senior members of the company.</small>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-with-button">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              ref={passwordRef}
              onFocus={() => handleFocus(passwordRef)}
              onChange={(e) => setPassword(e.target.value)}
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
              ref={confirmPasswordRef}
              onFocus={() => handleFocus(confirmPasswordRef)}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
        <button type="submit" className="submit-button">Sign Up</button>
      </form>
      {loading && <p>Loading...</p>}
      {errors.submit && <p className="error-message">Error: {errors.submit}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {data && <p className="success-message">Successfully signed up: {data.providerSignUp.username}</p>}
    </div>
  );
};

export default ProviderSignUp;
