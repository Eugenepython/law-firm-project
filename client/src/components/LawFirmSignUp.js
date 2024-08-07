// LawFirmSignUp.js
import React, { useState, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { LAW_FIRM_SIGN_UP } from '../graphql/mutations';
import './SignUp.css'; // Assuming you have a CSS file for styling

const LawFirmSignUp = () => {
  const [username, setUsername] = useState('');
  const [lawFirm, setLawFirm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [lawFirmSignUp, { data, loading, error }] = useMutation(LAW_FIRM_SIGN_UP);

  const usernameRef = useRef(null);
  const lawFirmRef = useRef(null);
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

    if (!lawFirm) {
      newErrors.lawFirm = 'Law Firm name is required';
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
        const response = await lawFirmSignUp({ variables: { username, lawFirm, email, password } });
        console.log('Form submitted:', response.data);
        setSuccessMessage('Successfully signed up!');
        // Reset form fields
        setUsername('');
        setLawFirm('');
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
      <h1>Law Firm - Sign Up</h1>
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
          <label htmlFor="lawFirm">Law Firm</label>
          <input
            type="text"
            id="lawFirm"
            value={lawFirm}
            ref={lawFirmRef}
            onFocus={() => handleFocus(lawFirmRef)}
            onChange={(e) => setLawFirm(e.target.value)}
          />
          {errors.lawFirm && <p className="error-message">{errors.lawFirm}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
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
      {data && <p className="success-message">Successfully signed up: {data.lawFirmSignUp.username}</p>}
    </div>
  );
};

export default LawFirmSignUp;
