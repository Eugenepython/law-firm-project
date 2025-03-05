//schema.js

import { gql } from 'graphql-tag';

const typeDefs = gql`
  type Query {
    hello: String
    getUsers: [User]
    getProviders: [Provider]
    lawFirmDetails(lawFirmId: ID!): User
    providerDetails: Provider
    getCases(lawFirmId: ID!): [Case]
    getCase(id: ID!): Case
    getDisbursementPaths(lawFirmId: ID!, caseId: ID!): [DisbursementPath]
    getDisbProviderUsers: [DisbProviderUser]
    previousDisbursements(disbursementId: ID!): [PotentialDisbursement]
    getDisbursementsByProviderIdAndCaseId(disbProviderId: ID!, caseId: ID): [PotentialDisbursement]
    getLawCasesWithClientInfo: [LawCaseWithClientInfo]
    disbProviderGetsPotentialDisbursements(     disbProviderId: ID!, clientName: String, nameOfExpert: String): [PotentialDisbursement]
  
  }





  type Mutation {

    lawFirmSignUp(
      username: String!
      lawFirm: String!
      email: String!
      password: String!
    ): User


    providerSignUp(
      username: String!
      disbFirm: String!
      email: String!
      password: String!
    ): Provider

    verifyUser(id: ID!): User
    verifyProvider(id: ID!): Provider
    acceptUser(id: ID!): User
    acceptProviderUser(id: ID!): Provider
    rejectUser(id: ID!): User
    rejectProviderUser(id: ID!): Provider
    lawFirmLogin(username: String!, password: String!): AuthPayload
    providerLogin(username: String!, password: String!): AuthPayload
    refreshToken(token: String!): AuthPayload

    createCase(
      clientName: String!
      role: String!
      retainerDate: String!
      retainerDescription: String!
      feeEarner: String!
      incidentDate: String!
      courtReference: String
      caseDescription: String!
      opposingParties: [String!]!
      caseType: String!
      diseaseClaimType: String
      yourReference: String
      lawFirmId: ID!
    ): Case


  createPotentialDisbursement(
  disbursementId: ID!,
  caseId: ID!,
  lawFirmId: ID!,
  report: String!,
  lawFirmAgreesToPay: Boolean!,
  priceType: String!,
  priceValue: Float,
  priceMin: Float,
  priceMax: Float,
  disbProviderId: ID!,
  expertDiscipline: String!,
  providerName: String!,
  nameOfExpert: String!,
  clientName: String!,
  disbProviderAccepts: Boolean = false, # ✅ Optional with default false
  proposalsRejectedByProvider: Boolean = false # ✅ Optional with default false
  providerAbandonsDisbursement: Boolean! = false # ✅ Optional with default false
): PotentialDisbursement!



createDisbursementPath(
    caseId: ID!
    lawFirmId: ID!
    providerName: String!
    invoiceReferences: String
    expertDiscipline: String!
    nameOfExpert: String
    disbProviderId: ID!  
): DisbursementPath!

createDisbProviderWithInvite(
    lawFirmId: ID!
    providerName: String!
    providerEmail: String!
    expertName: String
    expertDiscipline: String!
    caseId: ID!
): Provider

inviteProvider(
    username: String!, 
    email: String!
): Provider

completeProviderProfile(
    verificationToken: String!
    username: String!
    disbFirm: String!
    password: String!
    ): Provider

editAgreementToPay(
    disbursementId: ID!,
      report: String,
      lawFirmAgreesToPay: Boolean,
      priceType: String,
      priceValue: Float,
      priceMin: Float,
      priceMax: Float
    ): PotentialDisbursement
   
    retractAgreementToPay(
    disbursementId: ID!
    ): Boolean

providerRequestPasswordReset(
email: String!
): PasswordResetResponse!

    providerResetPassword(
    token: String!, 
    newPassword: String!
    ): ResponseMessage!


    lawFirmRequestPasswordReset(
    email: String!
    ): PasswordResetResponse!

lawFirmResetPassword(
token: String!, 
newPassword: String!
): PasswordResetResponse!

providerAcceptsDisbursement(
id: ID!
): PotentialDisbursement


  providerRejectsDisbursement(
  id: ID!
  ): PotentialDisbursement



  providerAbandonsDisbursement(
  id: ID!
  ): PotentialDisbursement

}




  type User {
    id: ID!
    username: String!
    lawFirm: String!
    email: String!
    status: String!
    verificationToken: String!
  }

  type Provider {
    id: ID!
    username: String!
    disbFirm: String!
    email: String!
    status: String!
    verificationToken: String
    createdAt: String
  }

  type AuthPayload {
    token: String
    refreshToken: String
    user: User
  }

  type Case {
    id: ID!
    clientName: String!
    role: String!
    retainerDate: String!
    retainerDescription: String!
    feeEarner: String!
    incidentDate: String!
    courtReference: String
    caseDescription: String!
    opposingParties: [String!]!
    caseType: String!
    diseaseClaimType: String
    yourReference: String
    lawFirmId: ID!
  }

  type DisbursementPath {
    id: ID!
    caseId: ID!
    lawFirmId: ID!
    providerName: String
    invoiceReferences: String
    expertDiscipline: String
    nameOfExpert: String
    disbProviderId: ID  
    createdAt: String
    updatedAt: String
  }

type PotentialDisbursement {
  id: ID!
  disbursementId: ID!
  caseId: ID!
  lawFirmId: ID!
  lawFirmName: String!
  report: String!
  lawFirmAgreesToPay: Boolean!
  priceType: String!
  priceValue: Float
  priceMin: Float
  priceMax: Float
  disbProviderId: ID!  
  expertDiscipline: String!
  providerName: String!
  disbProviderAccepts: Boolean!  # Fix case-sensitive issue
  nameOfExpert: String!
  createdAt: String!
  lawFirmRetractsBeforeDisbProviderAccepts: Boolean
  clientName: String
  proposalsRejectedByProvider: Boolean!
  providerAbandonsDisbursement: Boolean!

}



  type DisbProviderUser {
    id: ID!
    username: String!
    disbFirm: String!
    email: String!
    createdAt: String!
    status: String!
  }

   type LawCaseWithClientInfo {
    clientName: String
    opposingParties: [String]
    caseDescription: String
    feeEarner: String
    incidentDate: String
    originalClientName: String
  }

type PasswordResetResponse {
  success: Boolean!
  message: String!
}

type ResponseMessage {
  success: Boolean!
  message: String!
}



`;

export default typeDefs;


 