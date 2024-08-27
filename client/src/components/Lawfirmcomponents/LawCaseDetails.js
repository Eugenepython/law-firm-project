//Lawfirmcomponents/LawCaseDetails.js

import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GET_DISBURSEMENT_PATHS} from '../../graphql/queries'; 

const LawCaseDetails = () => {
  const caseDetails = useSelector((state) => state.cases.selectedCase);
  const navigate = useNavigate();

  if (!caseDetails) return <p>No case details available.</p>;

  const handleNewDisbursementPath = () => {
    navigate('/new-disbursement-path', {
      state: {
        caseId: caseDetails.id,
        lawFirmId: caseDetails.lawFirmId,
      },
    });
  };

  const handleSeeExistingDisbursementPaths = () => {
    navigate('/existing-disbursement-paths', {
      state: {
        caseId: caseDetails.id,
        lawFirmId: caseDetails.lawFirmId,
      },
    });
  };
  

  return (
    <div>
      <h1>Law Case Details</h1>
      {/* The case details rendering remains the same */}
      <p><strong>Client Name:</strong> {caseDetails.clientName}</p>
      <p><strong>Your Reference:</strong> {caseDetails.yourReference}</p>
      <p><strong>Court Reference:</strong> {caseDetails.courtReference}</p>
      <p><strong>Description:</strong> {caseDetails.caseDescription}</p>
      <p><strong>Role:</strong> {caseDetails.role}</p>
      <p><strong>Retainer Date:</strong> {caseDetails.retainerDate}</p>
      <p><strong>Retainer Description:</strong> {caseDetails.retainerDescription}</p>
      <p><strong>Fee Earner:</strong> {caseDetails.feeEarner}</p>
      <p><strong>Incident Date:</strong> {caseDetails.incidentDate}</p>
      <p><strong>Opposing Parties:</strong> {caseDetails.opposingParties?.join(', ')}</p>
      <p><strong>Case Type:</strong> {caseDetails.caseType}</p>
      <p><strong>Disease Claim Type:</strong> {caseDetails.diseaseClaimType}</p>
      <p><strong>Law Firm ID:</strong> {caseDetails.lawFirmId}</p>
      <p><strong>Case ID:</strong> {caseDetails.id}</p>

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleSeeExistingDisbursementPaths}>
          See Existing Disbursement Paths
        </button>
        <button onClick={handleNewDisbursementPath} style={{ marginLeft: '10px' }}>
          New Disbursement Path
        </button>
      </div>
    </div>
  );
};

export default LawCaseDetails;
