
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
    $invoiceReferences: String,
    $expertDiscipline: String!,
    $nameOfExpert: String,
    $disbProviderId: ID!
  ) {
    createDisbursementPath(
      caseId: $caseId,
      lawFirmId: $lawFirmId,
      providerName: $providerName,
      invoiceReferences: $invoiceReferences,
      expertDiscipline: $expertDiscipline,
      nameOfExpert: $nameOfExpert,
      disbProviderId: $disbProviderId 
    ) {
      id
      caseId
      lawFirmId
      providerName
      invoiceReferences
      expertDiscipline
      nameOfExpert
      disbProviderId
      createdAt
    }
  }
`;




export const CREATE_POTENTIAL_DISBURSEMENT = gql`
  mutation CreatePotentialDisbursement(
    $disbursementId: ID!,
    $caseId: ID!,
    $lawFirmId: ID!,
    $report: String!,
    $lawFirmAgreesToPay: Boolean!,
    $priceType: String!,
    $priceValue: Float,
    $priceMin: Float,
    $priceMax: Float,
    $disbProviderId: ID!,
    $expertDiscipline: String!,
    $providerName: String!,
    $nameOfExpert: String!,
    $clientName: String!,
    $disbProviderAccepts: Boolean! # ✅ Add this field
  ) {
    createPotentialDisbursement(
      disbursementId: $disbursementId,
      caseId: $caseId,
      lawFirmId: $lawFirmId,
      report: $report,
      lawFirmAgreesToPay: $lawFirmAgreesToPay,
      priceType: $priceType,
      priceValue: $priceValue,
      priceMin: $priceMin,
      priceMax: $priceMax,
      disbProviderId: $disbProviderId,
      expertDiscipline: $expertDiscipline,
      providerName: $providerName,
      nameOfExpert: $nameOfExpert,
      clientName: $clientName,
      disbProviderAccepts: $disbProviderAccepts # ✅ Add this field
    ) {
      id
      lawFirmRetractsBeforeDisbProviderAccepts
    }
  }
`;
// i just want that column to be automatically set as false when created 





export const CREATE_DISB_PROVIDER_WITH_INVITE = gql`
  mutation CreateDisbProviderWithInvite(
    $lawFirmId: ID!,
    $providerName: String!,
    $providerEmail: String!,
    $expertName: String,
    $expertDiscipline: String!,
    $caseId: ID!  # Add caseId here
  ) {
    createDisbProviderWithInvite(
      lawFirmId: $lawFirmId,
      providerName: $providerName,
      providerEmail: $providerEmail,
      expertName: $expertName,
      expertDiscipline: $expertDiscipline,
      caseId: $caseId  # Pass caseId here
    ) {
      id
      providerName
      providerEmail
      expertName
      expertDiscipline
      createdAt
    }
  }
`;



export const COMPLETE_PROVIDER_PROFILE = gql`
  mutation CompleteProviderProfile(
    $verificationToken: String!,  # Verification token sent in the invite
    $username: String!,           # New username for the provider
    $disbFirm: String!,           # New or confirmed firm name
    $password: String!            # New password
  ) {
    completeProviderProfile(
      verificationToken: $verificationToken,  # Token to identify the provider
      username: $username,                    # The updated username
      disbFirm: $disbFirm,                    # The updated or confirmed firm name
      password: $password                     # The updated password
    ) {
      id
      username
      disbFirm
      email
      status
    }
  }
`;

export const RETRACT_AGREEMENT_TO_PAY = gql`
  mutation RetractAgreementToPay($disbursementId: ID!) {
    retractAgreementToPay(disbursementId: $disbursementId)
  }
`;

export const EDIT_AGREEMENT_TO_PAY = gql`
  mutation EditAgreementToPay(
    $disbursementId: ID!,
    $report: String,
    $lawFirmAgreesToPay: Boolean,
    $priceType: String,
    $priceValue: Float,
    $priceMin: Float,
    $priceMax: Float
  ) {
    editAgreementToPay(
      disbursementId: $disbursementId,
      report: $report,
      lawFirmAgreesToPay: $lawFirmAgreesToPay,
      priceType: $priceType,
      priceValue: $priceValue,
      priceMin: $priceMin,
      priceMax: $priceMax
    ) {
      id
      report
      lawFirmAgreesToPay
      priceType
      priceValue
      priceMin
      priceMax
    }
  }
`;

export const PROVIDER_REQUEST_PASSWORD_RESET = gql`
  mutation ProviderRequestPasswordReset($email: String!) {
    providerRequestPasswordReset(email: $email) {
      success
      message
    }
  }
`;



export const PROVIDER_RESET_PASSWORD = gql`
  mutation ProviderResetPassword($token: String!, $newPassword: String!) {
    providerResetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export const LAW_FIRM_REQUEST_PASSWORD_RESET = gql`
  mutation LawFirmRequestPasswordReset($email: String!) {
    lawFirmRequestPasswordReset(email: $email) {
      success
      message
    }
  }
`;




export const LAW_FIRM_RESET_PASSWORD = gql`
  mutation LawFirmResetPassword($token: String!, $newPassword: String!) {
    lawFirmResetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;


export const PROVIDER_ACCEPTS_DISBURSEMENT_MUTATION = gql`
  mutation ProviderAcceptsDisbursement($id: ID!) {
    providerAcceptsDisbursement(id: $id) {
      id
      disbProviderAccepts
    }
  }
`;




export const PROVIDER_REJECTS_DISBURSEMENT_MUTATION = gql`
  mutation ProviderRejectsDisbursement($id: ID!) {
    providerRejectsDisbursement(id: $id) {
      id
      proposalsRejectedByProvider
    }
  }
`;


export const PROVIDER_ABANDONS_DISBURSEMENT_MUTATION = gql`
  mutation ProviderAbandonsDisbursement($id: ID!) {
    providerAbandonsDisbursement(id: $id) {
      id
      providerAbandonsDisbursement  # ✅ Ensure this matches the schema exactly
    } 
  }
`;






