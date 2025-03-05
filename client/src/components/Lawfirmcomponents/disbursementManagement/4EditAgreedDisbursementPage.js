// Lawfirmcomponents/disbursementManagement/4EditAgreedDisbursementPage.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RETRACT_AGREEMENT_TO_PAY, EDIT_AGREEMENT_TO_PAY } from '../../../graphql/mutations';

const EditAgreedDisbursementPage = ({ onSuccess }) => {
  const location = useLocation();
  const navigate = useNavigate();  // ✅ Enable navigation
  const disbursement = location.state?.disbursement || {};
  const disbursementId = disbursement?.id;

  console.log('Disbursement ID:', disbursementId);

  const [showEditForm, setShowEditForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // ✅ Success message state
  const [formData, setFormData] = useState({
    report: disbursement.report || '',
    priceType: disbursement.priceType || '',
    priceValue: disbursement.priceValue || '',
    priceMin: disbursement.priceMin || '',
    priceMax: disbursement.priceMax || '',
    lawFirmAgreesToPay: disbursement.priceType !== "no-agreement"  // ✅ Ensure default value
  });

  const [editAgreementToPay, { loading: editLoading, error: editError }] = useMutation(EDIT_AGREEMENT_TO_PAY, {
    onCompleted: (response) => {
      console.log('Agreement updated successfully:', response);
      setSuccessMessage("Updated successfully!");  // ✅ Show success message
      setShowEditForm(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Error updating agreement:', error.message);
    },
  });

   const [retractAgreementToPay] = useMutation(RETRACT_AGREEMENT_TO_PAY, {
      refetchQueries: ['GetDisbursements'], 
    })
  

    const handleRetract = async (disbursementId) => {
      try {
        const { data } = await retractAgreementToPay({ variables: { disbursementId } });
        if (data?.retractAgreementToPay === true) {
          alert("Instruction successfully retracted!");
          console.log("hello");
    
          setTimeout(() => {
            navigate(-1);  // Delay navigation slightly
          }, 100); 
        } else {
          alert("Retraction failed.");
        }
      } catch (error) {
        console.error("Error retracting instruction:", error);
        alert("Failed to retract instruction.");
      }
    };
    



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let updatedFormData = { ...prev, [name]: value };

      if (name === "priceType") {
        updatedFormData.lawFirmAgreesToPay = value !== "no-agreement";  // ✅ Always set value
        if (value === "single") {
          updatedFormData.priceMin = "";
          updatedFormData.priceMax = "";
        } else if (value === "range") {
          updatedFormData.priceValue = "";
        } else {
          updatedFormData.priceValue = "";
          updatedFormData.priceMin = "";
          updatedFormData.priceMax = "";
        }
      }
      return updatedFormData;
    });
  };

  const handleSave = async () => {
    if (!disbursementId) return;
    setSuccessMessage(""); // ✅ Reset success message on new save
    console.log('Saving updated data:', formData);
    try {
      await editAgreementToPay({
        variables: {
          disbursementId,
          report: formData.report,
          lawFirmAgreesToPay: formData.lawFirmAgreesToPay,
          priceType: formData.priceType,
          priceValue: formData.priceType === 'single' ? parseFloat(formData.priceValue) : null,
          priceMin: formData.priceType === 'range' ? parseFloat(formData.priceMin) : null,
          priceMax: formData.priceType === 'range' ? parseFloat(formData.priceMax) : null,
        },
      });
      navigate(-1)
    } 
    catch (err) {
      console.error('Mutation error:', err);
    }
  };


  

  return (
    <div className="edit-disbursement-container">
    <h2 className="page-title">Edit or Retract Agreement to Pay</h2>


    <div className="back-button-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
    </div>

    {successMessage && <p className="success-message">{successMessage}</p>}

    <div className="case-details-content">
      <p><strong>Client Name:</strong> {disbursement.clientName || 'N/A'}</p>
      <p><strong>Instructions:</strong> {disbursement.report || 'N/A'}</p>
      <p><strong>Disbursement Provider:</strong> {disbursement.disbProvider?.name || 'N/A'}</p>
      <p><strong>Expert Discipline:</strong> {disbursement.expertDiscipline || 'N/A'}</p>
      <p><strong>Expert Name:</strong> {disbursement.nameOfExpert || 'N/A'}</p>
      <p><strong>Law Firm Agrees to Pay:</strong> {disbursement.lawFirmAgreesToPay ? 'Yes' : 'No'}</p>
      <p><strong>Price Type:</strong> {disbursement.priceType || 'N/A'}</p>
      {disbursement.priceType === 'range' ? (
        <>
          <p><strong>Price Min:</strong> {disbursement.priceMin || 'N/A'}</p>
          <p><strong>Price Max:</strong> {disbursement.priceMax || 'N/A'}</p>
        </>
      ) : (
        <p><strong>Price Value:</strong> {disbursement.priceValue || 'N/A'}</p>
      )}
    </div>

    {editLoading && <p>Updating...</p>}
    {editError && <p className="error-message">Error: {editError.message}</p>}

    <div className="action-buttons-wrapper">
      <button className="edit-button" onClick={() => handleRetract(disbursement.id)}>Retract Instruction</button>
      <button className="edit-button" onClick={() => setShowEditForm(!showEditForm)}>
        {showEditForm ? 'Cancel' : 'Edit Price Proposals'}
      </button>
    </div>

    {showEditForm && (
      <div className="edit-form-container">
        <h3>Edit Price Proposals</h3>
        <label>Report:</label>
        <input type="text" name="report" value={formData.report} onChange={handleChange} />

        <label>Price Type:</label>
        <select name="priceType" value={formData.priceType} onChange={handleChange}>
          <option value="" disabled hidden>Choose one of the following</option>
          <option value="range">Range</option>
          <option value="single">Single Figure</option>
          <option value="no-agreement">No Agreement Yet to Pay</option>
        </select>

        {formData.priceType === "single" && (
          <>
            <label>Price Value:</label>
            <input type="number" name="priceValue" value={formData.priceValue} onChange={handleChange} />
          </>
        )}

        {formData.priceType === "range" && (
          <>
            <label>Price Min:</label>
            <input type="number" name="priceMin" value={formData.priceMin} onChange={handleChange} />
            <label>Price Max:</label>
            <input type="number" name="priceMax" value={formData.priceMax} onChange={handleChange} />
          </>
        )}

        <button className="primary-button" onClick={handleSave}>Save Changes</button>
      </div>
    )}
  </div>
  );
};

export default EditAgreedDisbursementPage;



// can you make thislooks similar to the others? 