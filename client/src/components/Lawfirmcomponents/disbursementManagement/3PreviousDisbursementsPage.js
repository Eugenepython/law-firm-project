
// client/src/components/Lawfirmcomponents/disbursementManagement/3PreviousDisbursementsPage.js
import React, { useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { GET_DISBURSEMENTS_BY_PROVIDER_ID_AND_CASE_ID } from '../../../graphql/queries';
import { RETRACT_AGREEMENT_TO_PAY } from '../../../graphql/mutations';
import '../../CSScomponents/Modal.css';

const PreviousDisbursementsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { caseId, disbProviderId, nameOfExpert } = location.state || {};

  useEffect(() => {
    console.log("Case ID from location.state:", location.state.caseId);
    console.log("Client Name from location.state:", location.state.clientName);
  }, [location.state.caseId]);

  const { loading, error, data } = useQuery(GET_DISBURSEMENTS_BY_PROVIDER_ID_AND_CASE_ID, {
    variables: { disbProviderId, caseId },
    skip: !disbProviderId || !caseId,
    fetchPolicy: 'network-only',
  });

  console.log("data       ",  data, "     this is data")

  const [retractAgreementToPay] = useMutation(RETRACT_AGREEMENT_TO_PAY, {
    refetchQueries: ['GetDisbursements'],
  });

  if (loading) return <p>Loading previous reports/advice/fees...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  // Filter disbursements by nameOfExpert
  const disbursements = (data?.getDisbursementsByProviderIdAndCaseId || []).filter(
    (disbursement) =>
      disbursement.caseId === location.state.caseId &&
      disbursement.nameOfExpert === nameOfExpert
  );

  console.log("Fetched disbursements:", disbursements);

  const handleEditAgreed = (disbursement) => {
    console.log('Edit disbursement:', disbursement);
    //navigate(/edit-agreed-disbursement/${disbursement.id}, { state: { disbursement } });
    navigate(`/edit-agreed-disbursement/${disbursement.id}`, { state: { disbursement } });
  };


  const agreedDisbursements = disbursements.filter(
    (d) =>
      d.disbProviderAccepts == true && // Agreement exists
    d.proposalsRejectedByProvider !== true &&
    d.providerAbandonsDisbursement !== true
  );
  
  
  

  const retractedDisbursements = disbursements.filter(
    (d) =>
      !agreedDisbursements.includes(d) && // Exclude agreed disbursements
      (d.lawFirmRetractsBeforeDisbProviderAccepts === true ||
        d.lawFirmRetractsBeforeDisbProviderAccepts === "t")
  );


  const nonAgreedDisbursements = disbursements.filter(
    (d) =>
      !agreedDisbursements.includes(d) && // Exclude agreed disbursements
      !d.lawFirmAgreesToPay &&
      !(
        d.lawFirmRetractsBeforeDisbProviderAccepts === true ||
        d.lawFirmRetractsBeforeDisbProviderAccepts === "t"
      )
  );



  const withAgreementDisbursements = disbursements.filter(
    (d) =>
      !agreedDisbursements.includes(d) && // Exclude agreed disbursements
      d.lawFirmAgreesToPay &&
      !(
        d.lawFirmRetractsBeforeDisbProviderAccepts === true ||
        d.lawFirmRetractsBeforeDisbProviderAccepts === "t"
      ) &&
      d.proposalsRejectedByProvider !== true &&
      d.providerAbandonsDisbursement !== true
  );
  
  
  const rejectedByProvider = disbursements.filter((d) => d.proposalsRejectedByProvider  === true);
  const abandonedByProvider = disbursements.filter((d) => d.providerAbandonsDisbursement === true);


  

  return (
<div className="disbursement-container">
        <h2 >Existing Instructions</h2>
        <div className="back-button-wrapper">
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>


      <div className="case-details-content">
      <p className="case-detail">Client Name: {location.state.clientName}</p>
      <p className="case-detail">Expert Name: {location.state.nameOfExpert}</p>
      <p className="case-detail">Discipline: {location.state.expertDiscipline}</p>
      <p className="case-detail">Provider: {location.state.providerName}</p>
</div>




      <div className="disbursements-container">
        <div className="disbursements-column">
          <h3>Agreement to pay and accepted by Provider</h3>
          {agreedDisbursements.length > 0 ? (
            <ul>
                  {agreedDisbursements.map((disbursement, index) => (
     <li key={disbursement.id || index} className="case-details-content">
     <p><strong>Instructions:</strong> {disbursement.report || 'No report provided'}</p>
     
     <p><strong>Client Name:</strong> {disbursement.clientName}</p>
     <p><strong>Expert Name:</strong> {disbursement.nameOfExpert}</p>
     <p><strong>Discipline:</strong> {disbursement.expertDiscipline}</p>
     <p><strong>Provider Name:</strong> {disbursement.providerName}</p>
   
     <hr /> {/* A subtle separator for clarity */}
   
     <p><strong>Agreement to Pay:</strong> Yes</p>
     <p><strong>Price Type:</strong> {disbursement.priceType}</p>
   
     {disbursement.priceType === 'range' ? (
       <p>
         <strong>Price Range:</strong> {disbursement.priceMin || 'Not specified'} - {disbursement.priceMax || 'Not specified'}
       </p>
     ) : (
       <p>
         <strong>Price Value:</strong> {disbursement.priceValue != null ? disbursement.priceValue : 'Not specified'}
       </p>
     )}
   
     <p><strong>Payment Terms:</strong> {disbursement.paymentTerms || 'Not specified'}</p>
   </li>
   
                ))}
            </ul>
          ) : (
            <p>No payment figures/parameters agreed found.</p>
          )}
        </div>

        <div className="disbursements-column">
  <h3>Instructions sent with payment parameters, waiting for confirmation from Provider</h3>
  {withAgreementDisbursements.length > 0 ? (
    <ul>
      {withAgreementDisbursements.map((disbursement, index) => (
     <li key={disbursement.id || index} className="case-details-content">
     <p><strong>Instructions:</strong> {disbursement.report || 'No report provided'}</p>
     
     <p><strong>Client Name:</strong> {disbursement.clientName}</p>
     <p><strong>Expert Name:</strong> {disbursement.nameOfExpert}</p>
     <p><strong>Discipline:</strong> {disbursement.expertDiscipline}</p>
     <p><strong>Provider Name:</strong> {disbursement.providerName}</p>
   
     <hr /> {/* A subtle separator for clarity */}
   
     <p><strong>Agreement to Pay:</strong> Yes</p>
     <p><strong>Price Type:</strong> {disbursement.priceType}</p>
   
     {disbursement.priceType === 'range' ? (
       <p>
         <strong>Price Range:</strong> {disbursement.priceMin || 'Not specified'} - {disbursement.priceMax || 'Not specified'}
       </p>
     ) : (
       <p>
         <strong>Price Value:</strong> {disbursement.priceValue != null ? disbursement.priceValue : 'Not specified'}
       </p>
     )}
   
     <p><strong>Payment Terms:</strong> {disbursement.paymentTerms || 'Not specified'}</p>
   
          <br />
          <button className="edit-button" onClick={() => handleEditAgreed(disbursement)}>
            Retract/change agreement
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p>Empty</p>
  )}
</div>

<div className="disbursements-column">
  <h3>Instructions sent without agreement on payment figures</h3>
  {nonAgreedDisbursements.length > 0 ? (
    <ul>
      {nonAgreedDisbursements.map((disbursement, index) => (
     <li key={disbursement.id || index} className="case-details-content">
     <p><strong>Instructions:</strong> {disbursement.report || 'No report provided'}</p>
     <p><strong>Client Name:</strong> {disbursement.clientName}</p>
     <p><strong>Expert Name:</strong> {disbursement.nameOfExpert}</p>
     <p><strong>Discipline:</strong> {disbursement.expertDiscipline}</p>
     <p><strong>Provider Name:</strong> {disbursement.providerName}</p>
     <hr /> {/* A subtle separator for clarity */}
     <p><strong>Agreement to Pay:</strong> Yes</p>
     <p><strong>Price Type:</strong> {disbursement.priceType}</p>
   
     {disbursement.priceType === 'range' ? (
       <p>
         <strong>Price Range:</strong> {disbursement.priceMin || 'Not specified'} - {disbursement.priceMax || 'Not specified'}
       </p>
     ) : (
       <p>
         <strong>Price Value:</strong> {disbursement.priceValue != null ? disbursement.priceValue : 'Not specified'}
       </p>
     )}
   
     <p><strong>Payment Terms:</strong> {disbursement.paymentTerms || 'Not specified'}</p>
   
          <br />
          <button className="edit-button" onClick={() => handleEditAgreed(disbursement)}>
            Retract/change agreement
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p>Empty.</p>
  )}
</div>

<div className="disbursements-column">
  <h3>Instructions retracted by Law Firm</h3>
  {retractedDisbursements.length > 0 ? (
    <ul>
      {retractedDisbursements.map((disbursement, index) => (
        <li key={disbursement.id || index} className="case-details-content">
  <strong>Instructions:</strong> {disbursement.report || 'No report provided'}
          <p><strong>Client Name:</strong> {disbursement.clientName}</p>
          <p><strong>Expert Name:</strong> {disbursement.nameOfExpert}</p>
          <p><strong>Discipline:</strong> {disbursement.expertDiscipline}</p>
          <p><strong>Provider Name:</strong> {disbursement.providerName}</p>
        </li>
      
      ))}
    </ul>
  ) : (
    <p>No retracted instructions found.</p>
  )}
</div>

<div className="disbursements-column">
  <h3>Rejected by Provider</h3>
  {rejectedByProvider.length > 0 ? (
    <ul>
      {rejectedByProvider.map((disbursement, index) => (
        <li key={disbursement.id || index} className="case-details-content">
           <strong>Instructions:</strong> {disbursement.report || 'No report provided'}
          <p><strong>Client Name:</strong> {disbursement.clientName}</p>
          <p><strong>Expert Name:</strong> {disbursement.nameOfExpert}</p>
          <p><strong>Discipline:</strong> {disbursement.expertDiscipline}</p>
          <p><strong>Provider Name:</strong> {disbursement.providerName}</p>

        </li>
      ))}
    </ul>
  ) : (
    <p>No rejections found.</p>
  )}
</div>




<div className="disbursements-column">
  <h3>Abandoned by Provider</h3>
  {abandonedByProvider.length > 0 ? (
    <ul>
      {abandonedByProvider.map((disbursement, index) => (
        <li key={disbursement.id || index} className="case-details-content">
  <strong>Instructions:</strong> {disbursement.report || 'No report provided'}
          <p><strong>Client Name:</strong> {disbursement.clientName}</p>
          <p><strong>Expert Name:</strong> {disbursement.nameOfExpert}</p>
          <p><strong>Discipline:</strong> {disbursement.expertDiscipline}</p>
          <p><strong>Provider Name:</strong> {disbursement.providerName}</p>

        </li>
      ))}
    </ul>
  ) : (
    <p>No abandoned requests found.</p>
  )}
</div>





      </div>
   
    </div>
  );
};

export default PreviousDisbursementsPage;

// i would like t have smiliar set up here as well 