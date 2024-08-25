// client/src/components/Lawfirmcomponents/ExistingDisbursementPaths.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ExistingDisbursementPaths = () => {
  const { caseId } = useParams();
  const [disbursementPaths, setDisbursementPaths] = useState([]);

  useEffect(() => {
    // Mock fetch function - replace with actual data fetching logic
    const fetchDisbursementPaths = async () => {
      try {
        // Fetch disbursement paths based on the caseId
        const response = await fetch(`/api/disbursement-paths?caseId=${caseId}`);
        const data = await response.json();
        setDisbursementPaths(data);
      } catch (error) {
        console.error('Error fetching disbursement paths:', error);
      }
    };

    fetchDisbursementPaths();
  }, [caseId]);

  return (
    <div>
      <h1>Existing Disbursement Paths for Case ID: {caseId}</h1>
      {disbursementPaths.length > 0 ? (
        <ul>
          {disbursementPaths.map((path) => (
            <li key={path.id}>
              <strong>Provider:</strong> {path.providerName}<br />
              <strong>Invoice Reference:</strong> {path.invoiceReferences}<br />
              <strong>Expert Discipline:</strong> {path.expertDiscipline}
            </li>
          ))}
        </ul>
      ) : (
        <p>No disbursement paths found for this case.</p>
      )}
    </div>
  );
};

export default ExistingDisbursementPaths;
