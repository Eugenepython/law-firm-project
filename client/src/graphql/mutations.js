// src/graphql/mutations.js
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
