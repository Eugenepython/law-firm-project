// src/components/Lawfirmcomponents/CreateCase.js

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { addCase } from '../../redux/slices/caseSlice';
import { CREATE_CASE_MUTATION } from '../../graphql/mutations';
import '../CSScomponents/CreateCase.css';

const CreateCase = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    role: '',
    otherRole: '',
    retainerDate: '',
    retainerDescription: '',
    feeEarner: '',
    incidentDate: '',
    courtReference: '',
    caseDescription: '',
    opposingParties: [''],
    caseType: '',
    diseaseClaimType: '',
    yourReference: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const lawFirmId = useSelector((state) => state.user.lawFirmId); // Retrieve lawFirmId from Redux

  const [createCase, { loading, error }] = useMutation(CREATE_CASE_MUTATION);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOpposingPartyChange = (index, value) => {
    const updatedOpposingParties = [...formData.opposingParties];
    updatedOpposingParties[index] = value;
    setFormData({
      ...formData,
      opposingParties: updatedOpposingParties,
    });
  };

  const addOpposingParty = () => {
    setFormData({
      ...formData,
      opposingParties: [...formData.opposingParties, ''],
    });
  };

  const removeOpposingParty = (index) => {
    const updatedOpposingParties = formData.opposingParties.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      opposingParties: updatedOpposingParties,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting case with data:', formData);
    try {
      const { data } = await createCase({
        variables: { 
          ...formData,
          lawFirmId, // Ensure lawFirmId is included in the variables
        }
      });
      console.log('Mutation response:', data);
      dispatch(addCase(data.createCase));
      navigate('/lawfirm-home/view-cases');
    } catch (err) {
      console.error('Error creating case:', err);
      if (err.networkError) {
        console.error('Network error:', err.networkError);
      }
      if (err.graphQLErrors) {
        console.error('GraphQL errors:', err.graphQLErrors);
        err.graphQLErrors.forEach((error) => {
          console.error('GraphQL Error Message:', error.message);
          console.error('Error Extensions:', error.extensions);
        });
      }
    }
  };

  return (
    <div className="container">
      <h1>Create a New Case</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Client Name:</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Role in Case:</label>
          <select name="role" value={formData.role} onChange={handleInputChange} required>
            <option value="" disabled>
              Select Role
            </option>
            <option value="Claimant">Claimant</option>
            <option value="Defendant">Defendant</option>
            <option value="Second Defendant">Second Defendant</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {formData.role === 'Other' && (
          <div className="indented-field">
            <label>Describe Other Role:</label>
            <input
              type="text"
              name="otherRole"
              value={formData.otherRole}
              onChange={handleInputChange}
              required
            />
          </div>
        )}

        <div>
          <label>Retainer Date:</label>
          <input
            type="date"
            name="retainerDate"
            value={formData.retainerDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Retainer Description:</label>
          <textarea
            name="retainerDescription"
            value={formData.retainerDescription}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Fee Earner Making Request:</label>
          <input
            type="text"
            name="feeEarner"
            value={formData.feeEarner}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Incident Date:</label>
          <input
            type="date"
            name="incidentDate"
            value={formData.incidentDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Court Reference Number (if issued):</label>
          <input
            type="text"
            name="courtReference"
            value={formData.courtReference}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label>Brief Description of Case:</label>
          <input
            type="text"
            name="caseDescription"
            maxLength="100"
            value={formData.caseDescription}
            onChange={handleInputChange}
            required
          />
        </div>

        {formData.opposingParties.map((party, index) => (
          <div className="field-group" key={index}>
            <label>Opposing Party {index + 1}:</label>
            <div className="input-group">
              <input
                type="text"
                value={party}
                onChange={(e) => handleOpposingPartyChange(index, e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => removeOpposingParty(index)}
                className="remove-button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div className="add-opposing-group">
          <button
            type="button"
            onClick={addOpposingParty}
            className="add-opposing-party"
          >
            Add Opposing Party
          </button>
        </div>

        <div>
          <label>Type of Case:</label>
          <select
            name="caseType"
            value={formData.caseType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Type of Case</option>
            <option value="Civil Litigation">Civil Litigation</option>
            <option value="Clinical Negligence">Clinical Negligence</option>
            <option value="Debt Recovery">Debt Recovery</option>
            <option value="Disease Claim">Disease Claim</option>
            <option value="Employment Dispute">Employment Dispute</option>
            <option value="Employers Liability">Employers Liability</option>
            <option value="Landlord and Tenant Dispute">
              Landlord and Tenant Dispute
            </option>
            <option value="Occupiers Liability">Occupiers Liability</option>
            <option value="Professional Negligence">
              Professional Negligence
            </option>
            <option value="Product Liability">Product Liability</option>
            <option value="Property Damage">Property Damage</option>
            <option value="Public Liability">Public Liability</option>
            <option value="Road Traffic Accident (RTA)">
              Road Traffic Accident (RTA)
            </option>
          </select>
        </div>
        {formData.caseType === 'Disease Claim' && (
          <div>
            <label>Type of Disease Claim:</label>
            <select
              name="diseaseClaimType"
              value={formData.diseaseClaimType}
              onChange={handleInputChange}
              required
            >
              <option value="Asbestosis">Asbestosis</option>
              <option value="Mesothelioma">Mesothelioma</option>
              <option value="Noise-Induced Hearing Loss (NIHL)">
                Noise-Induced Hearing Loss (NIHL)
              </option>
              <option value="Occupational Asthma">Occupational Asthma</option>
              <option value="Vibration White Finger">Vibration White Finger</option>
              <option value="Silicosis">Silicosis</option>
              <option value="Pneumoconiosis">Pneumoconiosis</option>
              <option value="Occupational Dermatitis">
                Occupational Dermatitis
              </option>
              <option value="Work-Related Upper Limb Disorders (WRULDs)">
                Work-Related Upper Limb Disorders (WRULDs)
              </option>
            </select>
          </div>
        )}

        <div>
          <label>Your Reference:</label>
          <input
            type="text"
            name="yourReference"
            value={formData.yourReference}
            onChange={handleInputChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Case'}
        </button>
        {error && (
          <p className="error-message">Error creating case: {error.message}</p>
        )}
      </form>
    </div>
  );
};

export default CreateCase;
