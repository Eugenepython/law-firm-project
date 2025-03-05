// src/components/Lawfirmcomponents/ViewCases.js

import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCase, setCases } from '../../../redux/slices/caseSlice';
import { GET_CASES } from '../../../graphql/queries'; 

const ViewCases = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lawFirmId = useSelector((state) => state.user.lawFirmId);
  const casesFromRedux = useSelector((state) => state.cases.cases);
  console.log('casesFromRedux:', casesFromRedux); 
  
 console.log(lawFirmId + "            lawFirmId");

  const { loading, error, data } = useQuery(GET_CASES, {
    variables: { lawFirmId },
    skip: !lawFirmId,
  });

  // Sync Redux state with the latest data from the server when data is loaded
  useEffect(() => {
    if (data && data.getCases) {
      // Check if the new case is in the Redux state but not in the fetched data
      const newCaseExistsInRedux = casesFromRedux.some(
        (caseItem) => !data.getCases.find((serverCase) => serverCase.id === caseItem.id)
      );
  
      if (!newCaseExistsInRedux) {
        // Only update the Redux state if no new cases exist in Redux
        dispatch(setCases(data.getCases));
      }
    }
  }, [data, casesFromRedux, dispatch]);
  

  const [yourReference, setYourReference] = useState('');
  const [clientName, setClientName] = useState('');
  const [courtReference, setCourtReference] = useState('');

  const handleHomeClick = () => {
    navigate('/lawfirm-home');
  };

  const handleCaseClick = (caseItem) => {
    const caseWithLawFirmId = { ...caseItem, lawFirmId };
    dispatch(selectCase(caseWithLawFirmId));
    navigate(`/case/${caseWithLawFirmId.id}`);
  };

  const hasSearch = (yourReference.length >= 3) || (clientName.length >= 3) || (courtReference.length >= 3);

  const filteredCases = hasSearch ? casesFromRedux.filter((caseItem) => {
    const yourRefMatch = yourReference
      ? caseItem.yourReference?.toLowerCase() === yourReference.toLowerCase()
      : true;

    const clientNameMatch = clientName.length >= 3
      ? caseItem.clientName?.toLowerCase().includes(clientName.toLowerCase())
      : true;

    const courtRefMatch = courtReference.length >= 3
      ? caseItem.courtReference?.toLowerCase().includes(courtReference.toLowerCase())
      : true;

    return yourRefMatch && clientNameMatch && courtRefMatch;
  }) : casesFromRedux;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="home-container">
      <button className="home-button" onClick={handleHomeClick}>Home</button>
      <div className="image-container">
        <img src="/Logo.jpeg" alt="Legal Services" className="top-image" />
      </div>
      <h1>View Cases</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Your Reference"
          value={yourReference}
          onChange={(e) => setYourReference(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Search by Client Name"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Search by Court Reference"
          value={courtReference}
          onChange={(e) => setCourtReference(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="tabs-container">
        {hasSearch && filteredCases.length > 0 ? (
          filteredCases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="this-tab"
              onClick={() => handleCaseClick(caseItem)} 
            >
              <h2>{caseItem.clientName}</h2>
              <p>Your Reference: {caseItem.yourReference}</p>
              <p>Court Reference: {caseItem.courtReference}</p>
              <p>Description: {caseItem.caseDescription}</p>
            </div>
          ))
        ) : (
          hasSearch && <p>No cases found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default ViewCases;
