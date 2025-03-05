
// client/src/components/Lawfirmcomponents/disbursementManagement/NewDisbursementPath.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_DISBURSEMENT_PATH, CREATE_DISB_PROVIDER_WITH_INVITE } from '../../../graphql/mutations';
import { GET_DISB_PROVIDER_USERS } from '../../../graphql/queries';

const NewDisbursementPath = () => {
  const navigate = useNavigate();
  const caseDetails = useSelector((state) => state.cases.selectedCase);
  const { id: caseId, lawFirmId, clientName, caseDescription, yourReference } = caseDetails;
  const [selectedProviderId, setSelectedProviderId] = useState('');

  const [nameOfExpert, setNameOfExpert] = useState('');
  const [providerName, setProviderName] = useState('');
  const [newProviderName, setNewProviderName] = useState('');
  const [newProviderEmail, setNewProviderEmail] = useState('');
  const [invoiceReferences, setInvoiceReferences] = useState('');
  const [expertDiscipline, setExpertDiscipline] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [createDisbursementPath, { loading }] = useMutation(CREATE_DISBURSEMENT_PATH);


  const [createDisbProviderWithInvite, { loading: inviteLoading }] = useMutation(
    CREATE_DISB_PROVIDER_WITH_INVITE, 
    {
      onError: (error) => {
        console.error('Mutation error:', error);
        setErrorMessage(`Error: ${error.message}`);
      },
    }
  );
  
  

  const { data: providerUsersData, loading: providersLoading, error: providersError } = useQuery(GET_DISB_PROVIDER_USERS);

  const handleProviderNameChange = (e) => {
    const inputValue = e.target.value;
    setProviderName(inputValue);
  
    // Find and log the selected provider's ID
    const selectedProvider = providerUsersData.getDisbProviderUsers.find(
      (provider) => provider.username === inputValue
    );
    if (selectedProvider) {
      setSelectedProviderId(selectedProvider.id);
      console.log("Selected Provider ID:", selectedProvider.id);
    }
  };
  

  // Function to handle creating a disbursement path for an existing provider
  const handleCreateDisbursementPath = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await createDisbursementPath({
        variables: {
          caseId,
          lawFirmId,
          providerName,
          invoiceReferences,
          expertDiscipline,
          nameOfExpert,
          disbProviderId: selectedProviderId,
        },
      });
      setSuccessMessage('Disbursement path created successfully');

      // Clear form inputs
      clearForm();

      setTimeout(() => {
        navigate(`/case/${caseId}`);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error creating disbursement path:', error);
      setErrorMessage(`Error creating disbursement path: ${error.message}`);
    }
  };

 
  const handleInviteProviderAndCreatePath = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');  
    console.log({
      lawFirmId,
      providerName: newProviderName,
      providerEmail: newProviderEmail,
      expertName: nameOfExpert,
      expertDiscipline,
      caseId  // Log caseId as well to ensure it's being passed
    });
    try {
      // Step 1: Create the new provider with "pending" status and disbursement path
      const { data: providerData } = await createDisbProviderWithInvite({
        variables: {
          lawFirmId,
          providerName: newProviderName,
          providerEmail: newProviderEmail,
          expertName: nameOfExpert,
          expertDiscipline,
          caseId  // Make sure caseId is passed here
        }
      });
  
      // Assuming your mutation returns some provider data (e.g., provider ID)
      const newProviderId = providerData?.createDisbProviderWithInvite?.id;
      if (!newProviderId) {
        throw new Error('Failed to create the new provider');
      }
  
      // No need to call createDisbursementPath again, it's already handled within the backend
      setSuccessMessage('Invitation sent and disbursement path created successfully');
      clearForm();
      setTimeout(() => {
        navigate(`/case/${caseId}`);
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error inviting provider:', error);
      setErrorMessage(`Error inviting provider: ${error.message}`);
    }
  };
  


  const clearForm = () => {
    setProviderName('');
    setNewProviderName('');
    setNewProviderEmail('');
    setInvoiceReferences('');
    setExpertDiscipline('');
    setNameOfExpert('');
  };
  



  if (providersLoading) return <p>Loading providers...</p>;
  if (providersError) return <p>Error loading providers: {providersError.message}</p>;

  return (
    <div className="new-disbursement-container">
      <h1>Create New Disbursement Path</h1>
      <div className="back-button-wrapper">
    <button className="back-button" onClick={() => navigate(`/case/${caseId}`)}>
      ← Back to Case Details
    </button>
  </div>

      <p><strong>Client Name:</strong> {clientName}</p>
      <p><strong>Case Description:</strong> {caseDescription}</p>
      <p><strong>Your Reference:</strong>{yourReference}</p>
<br/>



      <form>
        <div>
          <label>Name of Expert (Optional):</label>
          <input
            type="text"
            value={nameOfExpert}
            onChange={(e) => setNameOfExpert(e.target.value)}
          />
        </div>

        {showInviteForm ? (
          <div style={{ border: '2px solid #000', padding: '15px', marginTop: '15px', backgroundColor: '#f9f9f9' }}>
            <h3>Invite New Provider</h3>
            <label>Provider Name (Required):</label>
            <input
              type="text"
              value={newProviderName}
              onChange={(e) => setNewProviderName(e.target.value)}
              required
              style={{ marginBottom: '10px' }}
            />
            <br />
            <label>Provider Email (Required):</label>
            <input
              type="email"
              value={newProviderEmail}
              onChange={(e) => setNewProviderEmail(e.target.value)}
              required
            />
            <br />
            <button
              type="button"
              style={{ marginTop: '10px' }}
              onClick={() => setShowInviteForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ marginTop: '10px', marginLeft: '10px' }}
              onClick={handleInviteProviderAndCreatePath}
              disabled={inviteLoading}
            >
              {inviteLoading ? 'Inviting provider...' : 'Send Invitation and Create Disbursement'}
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label>Name of Provider/Invoicer/Contact (Required):</label>
            <select
              value={providerName}
              onChange={handleProviderNameChange}
              required
            >
              <option value="">Select Provider</option>
              {providerUsersData.getDisbProviderUsers.map((provider) => (
                <option key={provider.id} value={provider.username}>
                  {provider.username} - {provider.disbFirm}
                </option>
              ))}
            </select>
            <br />
            <button type="button" onClick={() => setShowInviteForm(true)}>
              Is the provider not in our database? Click here to invite them
            </button>
          </div>
        )}

        {/* Always show Expert Discipline and Reference fields */}
        <div>
          <label>Expert Discipline (Required):</label>
          <input
            type="text"
            value={expertDiscipline}
            onChange={(e) => setExpertDiscipline(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Reference (Optional):</label>
          <input
            type="text"
            value={invoiceReferences}
            onChange={(e) => setInvoiceReferences(e.target.value)}
          />
        </div>

        {!showInviteForm && (
          <div className="action-buttons-wrapper">
                      <button
                      className="primary-button"
            type="submit"
            onClick={handleCreateDisbursementPath}
            disabled={loading}
          >
            {loading ? 'Creating disbursement path...' : 'Create Disbursement Path'}
          </button>
          </div>
        )}

        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default NewDisbursementPath;
