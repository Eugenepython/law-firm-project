import { gql } from '@apollo/client';


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

