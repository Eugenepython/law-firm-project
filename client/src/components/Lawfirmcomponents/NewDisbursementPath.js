// client/src/components/Lawfirmcomponents/NewDisbursementPath.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation } from '@apollo/client';
import { CREATE_DISBURSEMENT_PATH } from '../../graphql/mutations';

const NewDisbursementPath = () => {
  const navigate = useNavigate();

  // Accessing selectedCase from Redux store
  const caseDetails = useSelector((state) => state.cases.selectedCase);

  // Destructure caseId and lawFirmId from caseDetails
  const { id: caseId, lawFirmId } = caseDetails;

  const [providerName, setProviderName] = useState('');
  const [invoiceReferences, setInvoiceReferences] = useState('');
  const [expertDiscipline, setExpertDiscipline] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

  const [createDisbursementPath, { loading, error }] = useMutation(CREATE_DISBURSEMENT_PATH);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(''); // Clear any previous success message
    try {
      const { data } = await createDisbursementPath({
        variables: {
          caseId,
          lawFirmId,
          providerName,
          invoiceReferences,
          expertDiscipline,
        },
      });

      // Log the entire mutation response to the console
      console.log('Disbursement path created:', data);

      // Reset form fields
      setProviderName('');
      setInvoiceReferences('');
      setExpertDiscipline('');

      // Show success message
      setSuccessMessage('Disbursement path created successfully');

      // Navigate back to the case details page
      setTimeout(() => {
        navigate(`/case/${caseId}`);
        window.location.reload();
      }, 1500); // Adjust the delay as needed

    } catch (error) {
      console.error('Error creating disbursement path:', error);
      alert(`Error creating disbursement path: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Create New Disbursement Path</h1>
      <p><strong>Case ID:</strong> {caseId}</p>
      <p><strong>Law Firm ID:</strong> {lawFirmId}</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name of Disbursement Provider:</label>
          <input
            type="text"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Reference(s) for Invoices:</label>
          <input
            type="text"
            value={invoiceReferences}
            onChange={(e) => setInvoiceReferences(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Type of Expert Discipline/Disbursement:</label>
          <input
            type="text"
            value={expertDiscipline}
            onChange={(e) => setExpertDiscipline(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating disbursement path...' : 'Create Disbursement Path'}
        </button>
        {loading && <p>Creating disbursement path...</p>}
        {successMessage && <p>{successMessage}</p>}
        {error && <p>Error: {error.message}</p>}
      </form>
    </div>
  );
};

export default NewDisbursementPath;
