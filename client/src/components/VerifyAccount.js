// VerifyAccount.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './VerifyAccount.css'; // Import the CSS file

const VerifyAccount = () => {
  const location = useLocation();
  const [status, setStatus] = useState('Verifying your account...');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      // Call the backend API to verify the token
      fetch(`http://localhost:4000/verify?token=${token}`)
        .then(response => response.text())
        .then(data => {
          console.log(data);
          setStatus(data);
        })
        .catch(error => {
          console.error('Error verifying account:', error);
          setStatus('Error verifying your account. Please try again later.');
        });
    }
  }, [location]);

  return (
    <div className="verify-container">
      <h1>{status}</h1>
      <img src="/Logo.jpeg" alt="Logo" />
    </div>
  );
};

export default VerifyAccount;

