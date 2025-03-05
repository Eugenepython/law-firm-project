
// src/components/LawFirmHomePage.js

import React, { useEffect } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import { GET_LAW_FIRM_DETAILS } from '../../../graphql/queries';
import { useNavigate } from 'react-router-dom';
import '../../CSScomponents/LawFirmHomePage.css';
import { clearUserData } from '../../../redux/slices/userSlice'; // ✅ Corrected path
import { clearSelectedCase } from '../../../redux/slices/caseSlice'; // ✅ Corrected path
import { resetReduxPersist } from '../../../redux/store'; // ✅ Corrected path


const LawFirmHomePage = () => {
  const lawFirmId = useSelector((state) => state.user.lawFirmId);
  const navigate = useNavigate();
  const client = useApolloClient();
  const dispatch = useDispatch();

  // Log the lawFirmId to check its value
  console.log('lawFirmId:', lawFirmId);

  // Conditionally run the query only if lawFirmId is available
  const { loading, error, data } = useQuery(GET_LAW_FIRM_DETAILS, {
    variables: { lawFirmId },
    skip: !lawFirmId, // Skip the query if lawFirmId is not available
    fetchPolicy: 'network-only',
  });

  // Log query status and data
  useEffect(() => {
    if (!lawFirmId) {
      console.error('lawFirmId is missing!');
    }
  }, [lawFirmId]);

  useEffect(() => {
    console.log('LawFirmHomePage component rendered');
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
      const { username, lawFirm, email } = data.lawFirmDetails || {};
      console.log('Username:', username);
      console.log('Law Firm:', lawFirm);
      console.log('Email:', email);
    }
  }, [loading, error, data]);

  const handleLogout = async () => {
    console.log('Handling logout');
    dispatch(clearUserData()); // ✅ Clears user state
    dispatch(clearSelectedCase()); // ✅ Clears selected case state
    resetReduxPersist(); // ✅ Resets Redux Persist storage
    await client.clearStore(); // ✅ Clears Apollo Client cache
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/lawfirm-login', { replace: true });
    window.location.reload(); // ✅ Ensures session is fully cleared
  };

  const handleCreateCase = () => {
    console.log('Navigating to create case');
    navigate('/lawfirm-home/create-case');
  };

  const handleViewCases = () => {
    console.log('Navigating to view cases');
    navigate('/lawfirm-home/view-cases');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const { username, lawFirm, email } = data?.lawFirmDetails || {};

  return (
    <div className="home-container">
      <div className="image-container">
        <img src="/Logo.jpeg" alt="Legal Services" className="top-image" />
      </div>
      <h1>Law Firm User: {lawFirm}</h1>
      <div className="user-details">
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Law Firm:</strong> {lawFirm}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>
      <div className="button-container">
        <button className="action-button" onClick={handleCreateCase}>
          Create New Case
        </button>
        <button className="action-button" onClick={handleViewCases}>
          View All Cases
        </button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default LawFirmHomePage;

