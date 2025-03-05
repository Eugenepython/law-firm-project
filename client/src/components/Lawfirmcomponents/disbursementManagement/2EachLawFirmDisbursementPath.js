// client/src/components/Lawfirmcomponents/disbursementManagement/2EachLawFirmDisbursementPath.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../CSScomponents/Modal.css';

const EachLawFirmDisbursementPath = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    key, // Unique key to trigger re-fetch
    disbursementId,
    caseId,
    lawFirmId,
    providerName,
    expertDiscipline,
    nameOfExpert,
    invoiceReferences,
    disbProviderId,
    createdAt,
    updatedAt,
    clientName,
  } = location.state || {};

  console.log("The Case ID from location.state:", location.state?.caseId);

  useEffect(() => {
    if (key) {
      console.log("Triggering re-fetch or refresh due to unique key change:", key);
    }
  }, [key]);

  const handleShowPotentialDisbursement = () => {
    navigate('/potential-disbursement', {
      state: {
        disbursementId,
        caseId,
        lawFirmId,
        providerName,
        expertDiscipline,
        nameOfExpert,
        disbProviderId,
        clientName,
      },
    });
  };

  const handleShowPreviousDisbursementsPage = () => {
    navigate('/previous-disbursements', {
      state: {
        disbursementId,
        caseId,
        lawFirmId,
        providerName,
        expertDiscipline,
        nameOfExpert,
        disbProviderId,
        clientName,
      },
    });
  };

  return (
    <div className="disbursement-path-container">
      {/* Back Button */}
      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h1 className="page-title">Disbursement Path Details</h1>

      {/* Case Details Section */}
      <div className="case-details-content">
        <p className="case-detail"><strong>Client Name:</strong> {clientName}</p>
        <p className="case-detail"><strong>Provider:</strong> {providerName}</p>
        <p className="case-detail"><strong>Expert Discipline:</strong> {expertDiscipline}</p>
        <p className="case-detail"><strong>Name of Expert:</strong> {nameOfExpert || 'Not provided'}</p>
      </div>

      {/* Buttons Section */}
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <div className="action-buttons-wrapper">
        <button className="primary-button" onClick={handleShowPotentialDisbursement}>
          Explore New Potential Report/Advice/Fee
        </button>
        <button className="primary-button" onClick={handleShowPreviousDisbursementsPage}>
         Existing instructions
        </button>
      </div>
    </div>
  );
};

export default EachLawFirmDisbursementPath;
