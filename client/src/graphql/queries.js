import { gql } from '@apollo/client';
import { getOperationDefinition, iterateObserversSafely } from '@apollo/client/utilities';


export const GET_LAW_FIRM_DETAILS = gql`
  query GetLawFirmDetails($lawFirmId: ID!) {
    lawFirmDetails(lawFirmId: $lawFirmId) {
      id
      username
      lawFirm
      email
    }
  }
`;


export const GET_PROVIDER_DETAILS = gql`
  query GetProviderDetails {
    providerDetails {
      id
      username
      disbFirm
      email
    }
  }
`;



export const GET_CASES = gql`
  query GetCases($lawFirmId: ID!) {
    getCases(lawFirmId: $lawFirmId) {
      id
      clientName
      role
      retainerDate
      retainerDescription
      feeEarner
      incidentDate
      courtReference
      caseDescription
      opposingParties
      caseType
      diseaseClaimType
      yourReference
    }
  }
`;

export const GET_CASE = gql`
  query GetCase($id: ID!) {
    getCase(id: $id) {
      id
      clientName
      role
      retainerDate
      retainerDescription
      feeEarner
      incidentDate
      courtReference
      caseDescription
      opposingParties
      caseType
      diseaseClaimType
      yourReference
      lawFirmId 
    }
  }
`;


export const GET_DISBURSEMENT_PATHS = gql`
  query GetDisbursementPaths($lawFirmId: ID!, $caseId: ID!) {
    getDisbursementPaths(lawFirmId: $lawFirmId, caseId: $caseId) {
      id
      caseId
      lawFirmId
      providerName
      invoiceReferences
      expertDiscipline
      nameOfExpert
      createdAt
      updatedAt
      disbProviderId
    }
  }
`;


export const GET_DISB_PROVIDER_USERS = gql`
  query GetDisbProviderUsers {
    getDisbProviderUsers {
      id
      username
      disbFirm
      email
      createdAt
      status
    }
  }
`;

export const GET_PREVIOUS_DISBURSEMENTS = gql`
  query GetPreviousDisbursements($disbursementId: ID!) {
    previousDisbursements(disbursementId: $disbursementId) {
      id
      report
      lawFirmAgreesToPay  
      priceType
      priceValue
      priceMin
      priceMax
      createdAt
    }
  }
`;

export const GET_DISBURSEMENTS_BY_PROVIDER_ID_AND_CASE_ID = gql`
  query GetDisbursementsByProviderIdAndCaseId($disbProviderId: ID!, $caseId: ID) {
    getDisbursementsByProviderIdAndCaseId(disbProviderId: $disbProviderId, caseId: $caseId) {
      id
      disbursementId
      caseId
      lawFirmId
      lawFirmName
      report
      lawFirmAgreesToPay  
      priceType
      priceValue
      priceMin
      priceMax
      createdAt
      disbProviderId
      expertDiscipline
      providerName
      nameOfExpert 
      lawFirmRetractsBeforeDisbProviderAccepts
      disbProviderAccepts
      clientName 
      proposalsRejectedByProvider
      providerAbandonsDisbursement
    }
  }
`;


export const DISB_PROVIDER_GETS_POTENTIAL_DISBURSEMENTS = gql`
  query DisbProviderGetsPotentialDisbursements(
    $disbProviderId: ID!
    $clientName: String
    $nameOfExpert: String
  ) {
    disbProviderGetsPotentialDisbursements(
      disbProviderId: $disbProviderId
      clientName: $clientName
      nameOfExpert: $nameOfExpert
    ) {
      id
      disbursementId
      caseId
      lawFirmId
      lawFirmName
      report
      lawFirmAgreesToPay
      priceType
      priceValue
      priceMin
      priceMax
      createdAt
      disbProviderId
      expertDiscipline
      providerName
      disbProviderAccepts
      lawFirmRetractsBeforeDisbProviderAccepts
      clientName
      nameOfExpert
      proposalsRejectedByProvider
      providerAbandonsDisbursement    }
  }
`;



