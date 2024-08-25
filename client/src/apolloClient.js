// src/apolloClient.js

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloLink } from '@apollo/client';
import { REFRESH_TOKEN } from './graphql/mutations';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Middleware to add the token to headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Error handling link to catch token expiration and attempt to refresh
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.extensions.code === 'UNAUTHENTICATED') {
        // Attempt to refresh the token
        return refreshToken().then((newTokens) => {
          if (newTokens) {
            // Store the new tokens
            localStorage.setItem('token', newTokens.token);
            localStorage.setItem('refreshToken', newTokens.refreshToken);

            // Retry the failed request with new token
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                authorization: `Bearer ${newTokens.token}`,
              },
            }));

            return forward(operation);
          } else {
            // If refresh fails, handle logout
            handleLogout();
          }
        }).catch(() => {
          // Handle refresh failure
          handleLogout();
        });
      }
    }
  }
});

// Function to handle logout and redirect to the appropriate login page
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');

  const userRole = localStorage.getItem('userRole'); // Get the user role
  if (userRole === 'lawfirm') {
    window.location.href = '/lawfirm-login';
  } else if (userRole === 'provider') {
    window.location.href = '/provider-login';
  } else {
    window.location.href = '/lawfirm-login'; // Default to lawfirm login if role is not set
  }
};

// Function to refresh the token using the REFRESH_TOKEN mutation
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN,
      variables: { token: refreshToken },
    });

    return data.refreshToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
};

// Combine all links
const link = ApolloLink.from([errorLink, authLink, httpLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;
