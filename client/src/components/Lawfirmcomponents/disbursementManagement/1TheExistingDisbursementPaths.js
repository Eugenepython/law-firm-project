// client/src/components/Lawfirmcomponents/1TheExistingDisbursementPaths.js

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_DISBURSEMENT_PATHS } from '../../../graphql/queries';

const ExistingDisbursementPaths = () => {
  const navigate = useNavigate();
  const selectedCase = useSelector((state) => state.cases.selectedCase);
  //const { id: caseId, lawFirmId, clientName } = selectedCase || {};

  const caseId = selectedCase?.id;  // ✅ Extract caseId
  const lawFirmId = selectedCase?.lawFirmId;
  const clientName = selectedCase?.clientName;
  const caseDescription = selectedCase?.caseDescription;  
  const yourReference = selectedCase?.yourReference;



  console.log("Fetching disbursement paths for Case ID:", caseId);
console.log("Fetching disbursement paths for Law Firm ID:", lawFirmId);

  useEffect(() => {
    if (!selectedCase) {
      console.log('Selected case not found, redirecting...');
      navigate('/cases');
    }
  }, [selectedCase, navigate]);

  const { loading, error, data } = useQuery(GET_DISBURSEMENT_PATHS, {
    variables: { lawFirmId, caseId },  // ✅ Pass caseId properly
    skip: !lawFirmId || !caseId,       // ✅ Skip query if either is missing
    onCompleted: (data) => console.log('Query completed:', data),
    onError: (error) => console.error('Query error:', error),
  });
  

  const [activeTabId, setActiveTabId] = useState(null);

  useEffect(() => {
    const handlePopState = (event) => event.preventDefault();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.error("Error fetching disbursement paths:", error);
    return <p>Error fetching disbursement paths. Please try again later.</p>;
  }

  const disbursementPaths = data?.getDisbursementPaths ?? [];
  console.log("Disbursement Paths:", disbursementPaths);

  // Group disbursement paths by providerName
  const groupedDisbursementPaths = disbursementPaths.reduce((acc, path) => {
    if (!acc[path.providerName]) {
      acc[path.providerName] = [];
    }
    acc[path.providerName].push(path);
    return acc;
  }, {});

  const handleTabClick = (path) => {
    setActiveTabId(path.id);
    navigate('/each-law-firm-disbursement-path', {
      state: {
        disbursementId: path.id,
        caseId: path.caseId,
        lawFirmId: path.lawFirmId,
        providerName: path.providerName,
        expertDiscipline: path.expertDiscipline,
        nameOfExpert: path.nameOfExpert || 'N/A',
        disbProviderId: path.disbProviderId,
        clientName: clientName,
      },
    });
  };

  return (
<div className="disbursement-paths-container">
        <h1>Existing Disbursement Paths</h1>

      <div className="back-button-wrapper">
    <button className="back-button" onClick={() => navigate(`/case/${caseId}`)}>
      ← Back to Case Details
    </button>
  </div>

      <div className="disbursement-paths-content">
      <p>Client Name: {clientName}</p>
      <p>Case Description : {caseDescription}</p>
      <p>Your Reference : {yourReference}</p>
      </div>
      
      {disbursementPaths.length === 0 && <p>No disbursement paths found for this case.</p>}

      <div className="tabs-container">
        {Object.entries(groupedDisbursementPaths).map(([providerName, paths]) => (
          <div key={providerName} className="provider-group">
            <h3 className="provider-heading">{providerName}</h3>
            <div className="tabs-group">
              {paths.map((path) => (
                <div
                  key={path.id}
                  className={`tab ${path.id === activeTabId ? 'active' : ''}`}
                  onClick={() => handleTabClick(path)}
                >
                  <div className="tab-header">
                    <span className="expert-discipline">{path.expertDiscipline}</span>
                    {path.nameOfExpert && <span className="name-of-expert">({path.nameOfExpert})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



export default ExistingDisbursementPaths;
