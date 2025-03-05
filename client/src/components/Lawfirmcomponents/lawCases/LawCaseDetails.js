//Lawfirmcomponents/LawCaseDetails.js

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const LawCaseDetails = () => {
  const caseDetails = useSelector((state) => state.cases.selectedCase);
  const navigate = useNavigate();

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = (event) => {
      navigate(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  if (!caseDetails) return <p>No case details available.</p>;


  const handleNewDisbursementPath = () => {
    navigate('/new-disbursement-path', {
      state: {
        caseId: caseDetails.id,
        lawFirmId: caseDetails.lawFirmId,
        clientName: caseDetails.clientName,
        caseDescription: caseDetails.caseDescription,
        yourReference: caseDetails.yourReference,
      },
    });
  };

  const handleSeeExistingDisbursementPaths = () => {
    const pathState = {
      caseId: caseDetails.id,
      lawFirmId: caseDetails.lawFirmId,
      clientName: caseDetails.clientName,
      caseDescription: caseDetails.caseDescription,
      yourReference: caseDetails.yourReference,
    };

    navigate('/existing-disbursement-paths', {
      state: pathState,
    });
  };
  

  const handleHomeClick = () => {
    navigate('/lawfirm-home');
  };

  
  const incidentDateFormatted = (y) => {
    console.log("Raw timestamp:", y); 
    if (!y || isNaN(y)) {
      console.error("Invalid timestamp provided:", y);
      return "Invalid Date";
    }
  
    const date = new Date(Number(y));
    console.log("Converted Date Object:", date);
  
    const formattedDate = date.toLocaleDateString("en-GB");
    console.log("Formatted Date:", formattedDate); // Check this log
    return formattedDate;
  };




  return (
    <div className="case-details-container">
    <div className="home-button-container">
      <button className="home-button" onClick={handleHomeClick}>Home</button>
    </div>
      <h1>Case Details</h1>
      <div className="case-details-content">
  <p className="case-detail"><strong>Client Name:</strong> {caseDetails.clientName}</p>
  <p className="case-detail"><strong>Client Role in Case:</strong> {caseDetails.role}</p>
  <p className="case-detail"><strong>Your Reference:</strong> {caseDetails.yourReference}</p>
  <p className="case-detail"><strong>Court Reference:</strong> {caseDetails.courtReference}</p>
  <p className="case-detail"><strong>Description:</strong> {caseDetails.caseDescription}</p>
  <p className="case-detail"><strong>Case ID:</strong> {caseDetails.id}</p>
  <p className="case-detail">
  <strong>Retainer Date:</strong> {incidentDateFormatted(caseDetails.retainerDate)}
</p>
  <p className="case-detail"><strong>Retainer Description:</strong> {caseDetails.retainerDescription}</p>
  <p className="case-detail"><strong>Fee Earner:</strong> {caseDetails.feeEarner}</p>
  <p className="case-detail"><strong>Incident Date:</strong> {incidentDateFormatted(caseDetails.incidentDate)}</p>
  <p className="case-detail"><strong>Opposing Parties:</strong> {caseDetails.opposingParties?.join(', ')}</p>
  <p className="case-detail"><strong>Case Type:</strong> {caseDetails.caseType}</p>
  <p className="case-detail"><strong>Disease Claim Type:</strong> {caseDetails.diseaseClaimType}</p>
</div>

      <div className="pathchoice-container">
        <button className="new-or-exising-path" onClick={handleSeeExistingDisbursementPaths}>
          See Existing Disbursement Paths
        </button>
        <button className="new-or-exising-path" onClick={handleNewDisbursementPath} style={{ marginLeft: '10px' }}>
          New Disbursement Path
        </button>
      </div>
    </div>
  );
};

export default LawCaseDetails;
