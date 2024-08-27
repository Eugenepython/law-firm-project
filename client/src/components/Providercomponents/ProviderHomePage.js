//ProviderHomePage.js

import React, { useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { GET_PROVIDER_DETAILS } from '../../graphql/queries'; // Adjust this query to fetch provider details
import { useNavigate } from 'react-router-dom';
import '../CSScomponents/ProviderHomePage.css'; // Make sure to create this CSS file or reuse the existing one

const ProviderHomePage = () => {
  const { loading, error, data } = useQuery(GET_PROVIDER_DETAILS, {
    fetchPolicy: 'network-only', // Ensure fresh data is fetched on component mount
  });
  const navigate = useNavigate(); // For navigation after logout
  const client = useApolloClient(); // Access Apollo Client instance

  useEffect(() => {
    console.log('ProviderHomePage component rendered');

    // Replace the history state to prevent going back to the login page
    navigate('.', { replace: true });

    // Add a new history entry to effectively 'block' the back button
    window.history.pushState(null, null, window.location.href);

    // Listen to popstate event to handle back button press
    const handlePopState = (event) => {
      // Replace the history entry again to block the back button
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
    if (data) console.log('Query data:', data);
  }, [loading, error, data]);

  // Logout function to clear tokens, clear cache, and redirect to login
  const handleLogout = async () => {
    // Clear the Apollo Client cache
    await client.clearStore();

    // Remove tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    // Redirect to the login page and replace the history entry
    navigate('/provider-login', { replace: true });

    // Optionally, you can also reload the page to ensure all components are reset
    window.location.reload();
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const { username, disbFirm, email } = data?.providerDetails || {}; // Adjust according to your query's response

  return (
    <div className="the-container">
      <h1>Welcome to your Disbursement Provider Home Page</h1>
      <div className="user-details">
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Disbursement Firm:</strong> {disbFirm}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default ProviderHomePage;
