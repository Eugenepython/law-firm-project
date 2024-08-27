//Home.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSScomponents/Home.css';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Replace the history entry when the Home page is loaded
    navigate('.', { replace: true });
  }, [navigate]);

  const handleLawFirmLogin = () => {
    navigate('/lawfirm-login');
  };
 
  const handleDisbProviderLogin = () => {
    navigate('/provider-login');
  };

  const handleNewUser = () => {
    navigate('/new-user');
  };

  return (
    <div className="home-container">
      <div className="image-container">
        <img src="/Logo.jpeg" alt="Legal Services" className="top-image" />
      </div>
      <h1>Welcome to Rubrikal Legal Disbursements Services</h1>
      <p className="description">
        Our SaaS solution streamlines the management of legal disbursements for law firms.
        <br /><br />
        Law firms can log in to create and manage case files, inviting disbursement providers to join specific cases. Through the platform, firms send formal disbursement requests, each with a unique reference number, to providers. Providers can then submit invoices against these requests, ensuring transparent and efficient tracking of disbursements. This system simplifies the process for law firms to monitor incurred and paid disbursements, facilitating accurate invoicing and payment management.
      </p>
      <div className="button-container">
        <button className="home-button" onClick={handleLawFirmLogin}>Law Firms Login</button>
        <button className="home-button" onClick={handleDisbProviderLogin}>Disbursement Providers Login</button>
        <button className="home-button" onClick={handleNewUser}>Sign Up</button>
      </div>
    </div>
  );
};

export default Home;
