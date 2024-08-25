
// src/graphql/mutations.js
import { gql } from '@apollo/client';

export const LAW_FIRM_SIGN_UP = gql`
  mutation LawFirmSignUp($username: String!, $lawFirm: String!, $email: String!, $password: String!) {
    lawFirmSignUp(username: $username, lawFirm: $lawFirm, email: $email, password: $password) {
      id
      username
      lawFirm
      email
    }
  }
`;


export const PROVIDER_SIGN_UP = gql`
  mutation ProviderSignUp($username: String!, $disbFirm: String!, $email: String!, $password: String!) {
    providerSignUp(username: $username, disbFirm: $disbFirm, email: $email, password: $password) {
      id
      username
      disbFirm
      email
    }
  }
`;


export const LAW_FIRM_LOGIN = gql`
  mutation LawFirmLogin($username: String!, $password: String!) {
    lawFirmLogin(username: $username, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
    
`;



export const PROVIDER_LOGIN = gql`
  mutation ProviderLogin($username: String!, $password: String!) {
    providerLogin(username: $username, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;


export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      token
      refreshToken
    }
  }
`;

export const CREATE_CASE_MUTATION = gql`
  mutation CreateCase(
    $lawFirmId: ID!,  # Add lawFirmId as a required parameter
    $clientName: String!,
    $role: String!,
    $retainerDate: String!,
    $retainerDescription: String!,
    $feeEarner: String!,
    $incidentDate: String!,
    $courtReference: String,
    $caseDescription: String!,
    $opposingParties: [String!]!,
    $caseType: String!,
    $diseaseClaimType: String,
    $yourReference: String!  
  ) {
    createCase(
      lawFirmId: $lawFirmId,  # Include lawFirmId in the mutation call
      clientName: $clientName,
      role: $role,
      retainerDate: $retainerDate,
      retainerDescription: $retainerDescription,
      feeEarner: $feeEarner,
      incidentDate: $incidentDate,
      courtReference: $courtReference,
      caseDescription: $caseDescription,
      opposingParties: $opposingParties,
      caseType: $caseType,
      diseaseClaimType: $diseaseClaimType,
      yourReference: $yourReference   
    ) {
      id
      clientName
      role
      retainerDate
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

export const CREATE_DISBURSEMENT_PATH = gql`
  mutation CreateDisbursementPath(
    $caseId: ID!,
    $lawFirmId: ID!,
    $providerName: String!,
    $invoiceReferences: String!,
    $expertDiscipline: String!
  ) {
    createDisbursementPath(
      caseId: $caseId,
      lawFirmId: $lawFirmId,
      providerName: $providerName,
      invoiceReferences: $invoiceReferences,
      expertDiscipline: $expertDiscipline
    ) {
      id
      caseId
      lawFirmId
      providerName
      invoiceReferences
      expertDiscipline
      createdAt
    }
  }
`;
