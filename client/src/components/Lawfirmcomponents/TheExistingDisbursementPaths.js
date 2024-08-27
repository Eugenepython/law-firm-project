// client/src/components/Lawfirmcomponents/ExistingDisbursementPaths.js

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_DISBURSEMENT_PATHS } from '../../graphql/queries';

const ExistingDisbursementPaths = () => {
  // Get caseId and lawFirmId from location state
  const location = useLocation();
  const { caseId, lawFirmId } = location.state || {}; // Default to empty object if state is not available

  // Query the disbursement paths with the given lawFirmId
  const { loading, error, data } = useQuery(GET_DISBURSEMENT_PATHS, {
    variables: { lawFirmId },
    skip: !lawFirmId, // Skip query if lawFirmId is not available
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Filter disbursement paths based on the caseId
  const disbursementPaths = data?.getDisbursementPaths?.filter(
    (path) => path.caseId === caseId
  ) || [];

  return (
    <div>
      <h1>Existing Disbursement Paths for Case ID: {caseId}</h1>
      <h2>Law Firm ID: {lawFirmId}</h2>
      {disbursementPaths.length > 0 ? (
        <ul>
          {disbursementPaths.map((path) => (
            <li key={path.id}>
              <strong>Provider:</strong> {path.providerName}<br />
              <strong>Invoice Reference:</strong> {path.invoiceReferences}<br />
              <strong>Expert Discipline:</strong> {path.expertDiscipline}<br />
              <strong>Created At:</strong> {new Date(path.createdAt).toLocaleDateString()}<br />
              <strong>Updated At:</strong> {new Date(path.updatedAt).toLocaleDateString()}
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
