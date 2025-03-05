// client/src/components/Lawfirmcomponents/disbursementManagement/3PotentialDisbursementPage.js

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_POTENTIAL_DISBURSEMENT } from '../../../graphql/mutations';
import { useLocation, useNavigate } from 'react-router-dom';

const PotentialDisbursementPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    disbursementId,
    caseId,
    lawFirmId,
    providerName,
    expertDiscipline,
    nameOfExpert,
    disbProviderId,
    clientName,
  } = location.state || {};

  const [formData, setFormData] = useState({
    report: '',
    lawFirmAgreesToPay: null,
    priceType: 'no-agreement',
    priceValue: '',
    priceMin: '',
    priceMax: '',
    clientName: clientName || '',
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createPotentialDisbursement] = useMutation(CREATE_POTENTIAL_DISBURSEMENT);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAgreementYes = () => {
    const confirmation = window.confirm(
      'Are you sure? This will trigger a signal to the provider that you will be liable for it.'
    );
    if (confirmation) {
      setFormData((prev) => ({ ...prev, lawFirmAgreesToPay: true }));
      setIsConfirmed(true);
    }
  };

  const handleAgreementChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      lawFirmAgreesToPay: value,
      priceType: value ? 'no-agreement' : 'no-agreement',
      priceValue: '',
      priceMin: '',
      priceMax: '',
    }));
    setIsConfirmed(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.report || formData.lawFirmAgreesToPay === null) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      await createPotentialDisbursement({
        variables: {
          disbursementId,
          caseId,
          lawFirmId,
          disbProviderId,
          expertDiscipline,
          providerName,
          nameOfExpert,
          report: formData.report,
          lawFirmAgreesToPay: formData.lawFirmAgreesToPay,
          priceType: formData.priceType,
          priceValue: formData.priceValue ? parseFloat(formData.priceValue) : null,
          priceMin: formData.priceMin ? parseFloat(formData.priceMin) : null,
          priceMax: formData.priceMax ? parseFloat(formData.priceMax) : null,
          lawFirmRetractsBeforeDisbProviderAccepts: false,
          clientName: formData.clientName,
          disbProviderAccepts: false
        },
      });
      navigate('/existing-disbursement-paths', {
        state: {
          key: Date.now(),
          disbursementId,
          caseId,
          lawFirmId,
          providerName,
          expertDiscipline,
          nameOfExpert,
          invoiceReferences: 'Some Reference',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <div className="disbursement-container">
      <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <h1 className="page-title">New Potential Disbursement</h1>

      <div className="case-details-content">
        <p className="case-detail"><strong>Provider Name:</strong> {providerName}</p>
        <p className="case-detail"><strong>Expert Discipline:</strong> {expertDiscipline}</p>
        <p className="case-detail"><strong>Client Name:</strong> {clientName}</p>
        <p className="case-detail"><strong>Name of Expert:</strong> {nameOfExpert}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kind of Advice & Opinion Sought</label>
          <input
            type="text"
            name="report"
            value={formData.report}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Do you agree to pay?</label>
          <div className="radio-group">
            <input
              type="radio"
              id="agreementYes"
              name="lawFirmAgreesToPay"
              value="true"
              checked={formData.lawFirmAgreesToPay === true}
              onChange={() => handleAgreementChange(true)}
            />
            <label htmlFor="agreementYes">Yes</label>
          </div>
          <div className="radio-group">
            <input
              type="radio"
              id="agreementNo"
              name="lawFirmAgreesToPay"
              value="false"
              checked={formData.lawFirmAgreesToPay === false}
              onChange={() => handleAgreementChange(false)}
            />
            <label htmlFor="agreementNo">No / Not Yet</label>
          </div>
        </div>

        {formData.lawFirmAgreesToPay !== false && (
          <div className="form-group">
            <label>Price Agreement</label>
            <select name="priceType" value={formData.priceType} onChange={handleChange} className="input-field">
              <option value="no-agreement">No figure agreed</option>
              <option value="single">Single Figure</option>
              <option value="range">Range</option>
              <option value="upper">Upper Limit</option>
            </select>
          </div>
        )}

        {formData.priceType === 'single' && (
          <div className="form-group">
            <label>Agreed Price (Single Figure)</label>
            <input
              type="number"
              name="priceValue"
              value={formData.priceValue}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        )}

        {formData.priceType === 'range' && (
          <div className="form-group">
            <label>Agreed Price Range</label>
            <input
              type="number"
              name="priceMin"
              placeholder="Min"
              value={formData.priceMin}
              onChange={handleChange}
              className="input-field"
              style={{ marginRight: '5px' }}
            />
            <input
              type="number"
              name="priceMax"
              placeholder="Max"
              value={formData.priceMax}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        )}

        {formData.priceType === 'upper' && (
          <div className="form-group">
            <label>Upper Limit Price</label>
            <input
              type="number"
              name="priceValue"
              placeholder="Upper Limit"
              value={formData.priceValue}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        )}

        <button type="submit" className="submit-button">Submit</button>
      </form>

      {/* Buttons */}
      <div className="action-buttons-wrapper">
        <button className="secondary-button" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  );
};

export default PotentialDisbursementPage;



