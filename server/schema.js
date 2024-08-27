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
    getDisbursementPaths(lawFirmId: ID!): [DisbursementPath]  # New Query added here
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
    createDisbursementPath(
      caseId: ID!
      lawFirmId: ID!
      providerName: String!
      invoiceReferences: String!
      expertDiscipline: String!
    ): DisbursementPath
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
    verificationToken: String!
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
    providerName: String!
    invoiceReferences: String!
    expertDiscipline: String!
    createdAt: String!
    updatedAt: String!  # Add updatedAt if required by the data
  }
`;

export default typeDefs;
