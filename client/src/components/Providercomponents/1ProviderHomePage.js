
// src/components/ProviderHomePage.js

import React, { useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_PROVIDER_DETAILS } from '../../graphql/queries'; // Adjust this query to fetch provider details
import { useNavigate } from 'react-router-dom';
import '../CSScomponents/ProviderHomePage.css'; // Ensure this CSS file is available or reuse an existing one

const ProviderHomePage = () => {
  const navigate = useNavigate();
  const client = useApolloClient();

  // Conditionally run the query to fetch provider details
  const { loading, error, data } = useQuery(GET_PROVIDER_DETAILS, {
    fetchPolicy: 'network-only', // Ensure fresh data is fetched each time
  });

  // Log query status and data
  useEffect(() => {
    console.log('ProviderHomePage component rendered');
    navigate('.', { replace: true });

    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    if (loading) console.log('Query loading...');
    if (error) console.error('Query error:', error);
    if (data) {
      console.log('Query data:', data);
      // Log individual data fields
      const { username, disbFirm, email, id } = data.providerDetails || {};
      console.log('Username:', username);
      console.log('Disbursement Firm:', disbFirm);
      console.log('Email:', email);
      console.log('Provider ID:', id);
    }
  }, [loading, error, data]);

  // Handle logout and navigation
  const handleLogout = async () => {
    console.log('Handling logout');
    await client.clearStore();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/provider-login', { replace: true });
    window.location.reload();
  };





const handleViewDisbursements = () => {
  console.log('Navigating to view disbursements');
  navigate('/provider-home/view-disbursements-requests', {
    state: {
      username,
      disbFirm,
      email,
      id,
    },
  });
};


  // Conditional rendering based on loading or error state
  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  // Destructure the provider details from the query data
  const { username, disbFirm, email, id } = data?.providerDetails || {};

  return (
    <div className="home-container">
      <div className="image-container">
        <img src="/Logo.jpeg" alt="Provider Services" className="top-image" />
      </div>
      <h1>Disbursement Provider: {disbFirm}</h1>
      <div className="user-details">
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Disbursement Firm:</strong> {disbFirm}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>
      <div className="button-container">
        <button className="action-button" onClick={handleViewDisbursements}>
          View Existing Disbursements and Requests
        </button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default ProviderHomePage;
