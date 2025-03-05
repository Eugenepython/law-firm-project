// src/components/2ViewDisbursementsAndRequestsPage.js


import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { DISB_PROVIDER_GETS_POTENTIAL_DISBURSEMENTS } from "../../../graphql/queries";
import { PROVIDER_ACCEPTS_DISBURSEMENT_MUTATION } from "../../../graphql/mutations";
import { PROVIDER_REJECTS_DISBURSEMENT_MUTATION } from "../../../graphql/mutations";
import { PROVIDER_ABANDONS_DISBURSEMENT_MUTATION } from "../../../graphql/mutations";

import "../../CSScomponents/ViewDisbursementsAndRequestsPage.css";

const ViewDisbursementsAndRequestsPage = () => {
  const location = useLocation();
  const { id: providerId, username, disbFirm } = location.state || {};

  const { loading, error, data } = useQuery(DISB_PROVIDER_GETS_POTENTIAL_DISBURSEMENTS, {
    variables: { disbProviderId: providerId },
    skip: !providerId,
  });


  const navigate = useNavigate(); // Initialize useNavigate

  const [acceptDisbursement] = useMutation(PROVIDER_ACCEPTS_DISBURSEMENT_MUTATION, {
    refetchQueries: [{ query: DISB_PROVIDER_GETS_POTENTIAL_DISBURSEMENTS, variables: { disbProviderId: providerId } }],
  });

  const [rejectDisbursementMutation] = useMutation(PROVIDER_REJECTS_DISBURSEMENT_MUTATION, {
    refetchQueries: [{ query: DISB_PROVIDER_GETS_POTENTIAL_DISBURSEMENTS, variables: { disbProviderId: providerId } }],
  });

  const [abandonDisbursementMutation] = useMutation(PROVIDER_ABANDONS_DISBURSEMENT_MUTATION, {
    refetchQueries: [{ query: DISB_PROVIDER_GETS_POTENTIAL_DISBURSEMENTS, variables: { disbProviderId: providerId } }],
  });
  



  const [expandedResponses, setExpandedResponses] = useState({});
  const [displayMode, setDisplayMode] = useState("lawFirm");
  const [expandedLawFirms, setExpandedLawFirms] = useState({});
  const [expandedClients, setExpandedClients] = useState({});
  const [expandedExperts, setExpandedExperts] = useState({});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleNavigateHome = () => {
    navigate("/provider-home");
  };

  const handleReportClick = (report) => {
    console.log("Report Details:", report);
    setExpandedResponses((prev) => ({
      ...prev,
      [report]: !prev[report], // Toggle visibility
    }));
  };

 



  const disbursements = data?.disbProviderGetsPotentialDisbursements || [];

  console.log("Disbursements:", disbursements[0].lawFirmRetractsBeforeDisbProviderAccepts  );

  const toggleExpand = (stateSetter, key) => {
    stateSetter((prev) => ({ ...prev, [key]: !prev[key] }));
  };


  const groupByLawFirm = disbursements.reduce((acc, item) => {
    if (!acc[item.lawFirmName]) {
      acc[item.lawFirmName] = { name: item.lawFirmName, clients: {} };
    }
    if (!acc[item.lawFirmName].clients[item.clientName]) {
      acc[item.lawFirmName].clients[item.clientName] = {};
    }
    if (!acc[item.lawFirmName].clients[item.clientName][item.nameOfExpert]) {
      acc[item.lawFirmName].clients[item.clientName][item.nameOfExpert] = [];
    }
    acc[item.lawFirmName].clients[item.clientName][item.nameOfExpert].push(item);
    return acc;
  }, {});

  const groupByClientName = disbursements.reduce((acc, item) => {
    if (!acc[item.clientName]) {
      acc[item.clientName] = { lawFirms: {} };
    }
    if (!acc[item.clientName].lawFirms[item.lawFirmName]) {
      acc[item.clientName].lawFirms[item.lawFirmName] = {};
    }
    if (!acc[item.clientName].lawFirms[item.lawFirmName][item.nameOfExpert]) {
      acc[item.clientName].lawFirms[item.lawFirmName][item.nameOfExpert] = [];
    }
    acc[item.clientName].lawFirms[item.lawFirmName][item.nameOfExpert].push(item);
    return acc;
  }, {});




  const handleAcceptDisbursement = async (id) => {
    console.log("📌 Attempting to accept Disbursement ID:", id); // Debug log
    try {
      const { data } = await acceptDisbursement({
        variables: { id }, // ✅ Correct key
      });
      console.log("✅ Disbursement Accepted:", data.providerAcceptsDisbursement);
    } catch (error) {
      console.error("❌ Error accepting disbursement:", error);
    }
  };



  const handleRejectDisbursement = async (id) => { 
    console.log("📌 Rejecting Disbursement - ID received:", id);
    if (!id) {
      console.error("❌ Error: No ID provided for rejecting disbursement.");
      return;
    }
    try {
      const response = await rejectDisbursementMutation({
        variables: { id },
      });
      console.log("✅ Full response:", response.data); // Log entire response
      console.log("✅ Disbursement Rejected Successfully:", response.data.providerRejectsDisbursement);
    } catch (error) {
      console.error("❌ Error Rejecting Disbursement:", error.message);
    }
  };
  
  const handleAbandonDisbursement = async (id) => {
    console.log("📌 Abandoning Disbursement - ID received:", id); // ✅ Log received ID
    if (!id) {
      console.error("❌ Error: No ID provided for abandoning disbursement.");
      return; // Prevent mutation if id is undefined/null
    }
    try {
      const response = await abandonDisbursementMutation({
        variables: { id }, // ✅ Ensure ID is passed correctly
      });
      console.log("✅ Disbursement Abandoned Successfully:", response.data.providerAbandonsDisbursement);
    } catch (error) {
      console.error("❌ Error Abandoning Disbursement:", error.message);
    }
  }
  


  return (
    <div>
<h2 className="title">Instructions</h2>

<div className="navButtons">
      
        <button className="homeButton" onClick={handleNavigateHome}>Home</button>
      </div>

      <div className="user-heading-container">
      <h3 className="subHeading">Firm: <span>{disbFirm}</span></h3>
  <h3 className="subHeading">Username: <span>{username}</span></h3>

</div>



<div className="topButtons">
  <button className="topButton" 
  onClick={() => setDisplayMode("lawFirm")}>Display by Law Firm</button>
  <button className="topButton" onClick={() => setDisplayMode("clientName")}>Display by Client Name</button>
</div>



      <div>
        {displayMode === "lawFirm" ? (
            <div className = "left-margin">
            <h3 className="firstTitle">Law Firms</h3>
            {Object.entries(groupByLawFirm).map(([lawFirmName, lawFirm]) => (
              <div key={lawFirmName}>
                <button className="firstButton" onClick={() => toggleExpand(setExpandedLawFirms, lawFirmName)}>
                  {expandedLawFirms[lawFirmName] ? "▼" : "▶"} <h4 className="firstGroup">{lawFirm.name}</h4>
                </button>
                {expandedLawFirms[lawFirmName] && (
                  <ul>
                    {Object.keys(lawFirm.clients).length > 0 && <h5 className="secondTitle">Clients</h5>}
                    {Object.entries(lawFirm.clients).map(([clientName, experts]) => (
                      <li key={clientName}>
                        <button className="secondButton" onClick={() => toggleExpand(setExpandedClients, clientName)}>
                          {expandedClients[clientName] ? "▼" : "▶"} <h4 className="secondGroup">{clientName}</h4>
                        </button>
                        {expandedClients[clientName] && (
                          <ul>
                            {Object.keys(experts).length > 0 && <h5 className="thirdTitle">Experts</h5>}
                            {Object.entries(experts).map(([expertName, reports]) => (
                              <li key={expertName}>
                                <button className="thirdButton" onClick={() => toggleExpand(setExpandedExperts, expertName)}>
                                  {expandedExperts[expertName] ? "▼" : "▶"} <h4 className="thirdGroup">{expertName}</h4>
                                </button>
                                {expandedExperts[expertName] && (
                                  <ul>
                                    {reports.length > 0 && <h6 className="fourthTitle">Reports</h6>}
                                    <ul>
                                      {reports.map((report) => (
                                        <li key={report.id}>
                        
                        
                        <div className="fourthButton" onClick={() => handleReportClick(report)}>
                        <ul className="report-card">
                        <li>📄 <strong>Instruction:</strong> {report.report}</li>
  <li>📄 <strong>Date of the initial instruction: </strong>{new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</li>
  <li>📄 <strong>Has Law Firm proposed payment terms?</strong> {report.lawFirmAgreesToPay ? "Yes" : report.lawFirmAgreesToPay === false ? "No" : "Unknown"}</li>
  {report.priceType === "single" && report.lawFirmAgreesToPay && (
    <li>📄 <strong>Instructor's Proposed Price:</strong> {report.priceValue}</li>
  )}
  {report.priceType === "range" && report.lawFirmAgreesToPay && (
    <>
      <li>📄 <strong>Instructor's Proposed Max price:</strong> {report.priceMax}</li>
      <li>📄 <strong>Instructor's Proposed Min price:</strong> {report.priceMin}</li>
    </>
  )}

  <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
    <li>📄 <strong>Client name:</strong> {report.clientName}</li>
    <li>📄 <strong>Discipline:</strong> {report.expertDiscipline}</li>
    <li>📄 <strong>Instructing Law firm:</strong> {report.lawFirmName}</li>
    <li>📄 <strong>Expert name:</strong> {report.nameOfExpert}</li>
    <br/>
    
    {!report.lawFirmRetractsBeforeDisbProviderAccepts &&
    <button  className = "respond-close" onClick={() => handleReportClick(report.id)}   >{expandedResponses[report.id] ? "Close" : "Respond"}</button>
    }
    {report.lawFirmRetractsBeforeDisbProviderAccepts && (
  <p style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
    Retracted by law firm
  </p>
)}
   
   
   
   
   
    {expandedResponses[report.id] && !report.lawFirmRetractsBeforeDisbProviderAccepts && (
            <div className="responseButtons">









{!report.disbProviderAccepts &&  !report.proposalsRejectedByProvider &&   (
  <button className="acceptButton" onClick={() => handleAcceptDisbursement(report.id)}>
    ✅ Accept
  </button>)
}

      {!report.proposalsRejectedByProvider &&  !report.disbProviderAccepts    &&    (
        <button className="rejectButton" onClick={() => handleRejectDisbursement(report.id)}>
  ❌ Reject
</button> )}


             {report.disbProviderAccepts && !report.providerAbandonsDisbursement && !report.proposalsRejectedByProvider ? 
             <button className="rejectButton" onClick={() => handleAbandonDisbursement(report.id)}>
              ❌ Abandon Instruction</button> 
             : null}
           
           
             {report.disbProviderAccepts &&  !report.disbProviderRejects && !report.providerAbandonsDisbursement && (<p style={{ color: "gray", fontSize: "0.9em" }}>✔  Accepted</p>)}
             {report.proposalsRejectedByProvider && (<p style={{ color: "gray", fontSize: "0.9em" }}>✔ Rejected</p>)}
              {report.providerAbandonsDisbursement && (<p style={{ color: "gray", fontSize: "0.9em" }}>✔ Accepted then Abandoned</p>)}

 







            </div>
          )}
  </div>
</ul>
                                          </div> 

                                        </li>
                                      ))}
                                      {reports.length > 0 && <h6 className="fourthTitle"><br/></h6>}
                                    </ul>
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className = "left-margin">
            <h3 className="firstTitle">Clients</h3>
            {Object.entries(groupByClientName).map(([clientName, client]) => (
              <div key={clientName}>
                <button className="firstButton" onClick={() => toggleExpand(setExpandedClients, clientName)}>
                  {expandedClients[clientName] ? "▼" : "▶"} <h4 className="firstGroup">{clientName}</h4>
                </button>
                {expandedClients[clientName] && (
                  <ul>
                    {Object.keys(client.lawFirms).length > 0 && <h5 className="secondTitle">Law Firms</h5>}
                    {Object.entries(client.lawFirms).map(([lawFirmName, experts]) => (
                      <li key={lawFirmName}>
                        <button className="secondButton" onClick={() => toggleExpand(setExpandedLawFirms, lawFirmName)}>
                          {expandedLawFirms[lawFirmName] ? "▼" : "▶"} <h4 className="secondGroup">{lawFirmName}</h4>
                        </button>
                        {expandedLawFirms[lawFirmName] && (
                          <ul>
                            {Object.keys(experts).length > 0 && <h5 className="thirdTitle">Experts</h5>}
                            {Object.entries(experts).map(([expertName, reports]) => (
                              <li key={expertName}>
                                <button className="thirdButton" onClick={() => toggleExpand(setExpandedExperts, expertName)}>
                                  {expandedExperts[expertName] ? "▼" : "▶"} <h4 className="thirdGroup">{expertName}</h4>
                                </button>
                                {expandedExperts[expertName] && (
                                  <ul>
                                    {reports.length > 0 && <h6 className="fourthTitle">Reports</h6>}
                                    <ul>
                                      {reports.map((report) => (
                                        <li key={report.id}>
                    
<div className="fourthButton" onClick={() => handleReportClick(report)}>
<ul className="report-card">
  <li>📄 <strong>Instruction:</strong> {report.report}</li>
  <li>📄 <strong>Date of the initial instruction:</strong> {new Date(report.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</li>
  <li>📄 <strong>Has Law Firm proposed payment terms?</strong> {report.lawFirmAgreesToPay ? "Yes" : report.lawFirmAgreesToPay === false ? "No" : "Unknown"}</li>
  {report.priceType === "single" && report.lawFirmAgreesToPay && (
    <li>📄 <strong>Instructor's Proposed Price:</strong> {report.priceValue}</li>
  )}
  {report.priceType === "range" && report.lawFirmAgreesToPay && (
    <>
      <li>📄 <strong>Instructor's Proposed Max price:</strong> {report.priceMax}</li>
      <li>📄 <strong>Instructor's Proposed Min price:</strong> {report.priceMin}</li>
    </>
  )}

  <div style={{ fontSize: "0.85em", opacity: 0.7 }}>
    <li>📄 <strong>Client name:</strong> {report.clientName}</li>
    <li>📄 <strong>Discipline:</strong> {report.expertDiscipline}</li>
    <li>📄 <strong>Instructing Law firm:</strong> {report.lawFirmName}</li>
    <li>📄 <strong>Expert name:</strong> {report.nameOfExpert}</li>
    <br/>
    
    
    
    
    
        
    {!report.lawFirmRetractsBeforeDisbProviderAccepts &&
    <button  onClick={() => handleReportClick(report.id)}   >{expandedResponses[report.id] ? "Close" : "Respond"}</button>
    }
    {report.lawFirmRetractsBeforeDisbProviderAccepts && (
  <p style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
    Retracted by law firm
  </p>
)}
    
    
    
    
    {expandedResponses[report.id] && (
 <div className="responseButtons">





{!report.disbProviderAccepts &&  !report.proposalsRejectedByProvider &&   (
  <button className="acceptButton" onClick={() => handleAcceptDisbursement(report.id)}>
    ✅ Accept
  </button>)
}

      {!report.proposalsRejectedByProvider &&  !report.disbProviderAccepts    &&    (
        <button className="rejectButton" onClick={() => handleRejectDisbursement(report.id)}>
  ❌ Reject
</button> )}


             {report.disbProviderAccepts && !report.providerAbandonsDisbursement && !report.proposalsRejectedByProvider ? 
             <button className="rejectButton" onClick={() => handleAbandonDisbursement(report.id)}>
              ❌ Abandon Instruction</button> 
             : null}
           
           
             {report.disbProviderAccepts &&  !report.disbProviderRejects && !report.providerAbandonsDisbursement && (<p style={{ color: "gray", fontSize: "0.9em" }}>✔  Accepted</p>)}
             {report.proposalsRejectedByProvider && (<p style={{ color: "gray", fontSize: "0.9em" }}>✔ Rejected</p>)}
              {report.providerAbandonsDisbursement && (<p style={{ color: "gray", fontSize: "0.9em" }}>✔ Accepted then Abandoned</p>)}

 


            </div>
          )}
  </div>
</ul>
                                          </div> 
                                        </li>
                                      ))}
                                      {reports.length > 0 && <h6 className="fourthTitle"><br/></h6>}
                                    </ul>
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDisbursementsAndRequestsPage;
