// src/apolloClient.js

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { ApolloLink } from '@apollo/client';
import { REFRESH_TOKEN } from './graphql/mutations';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_API || 'http://localhost:4000/graphql',
});

console.log('httpLink URI:', httpLink);
console.log('process.env.REACT_APP_GRAPHQL_API:', process.env.REACT_APP_GRAPHQL_API);

// so as i understand it, when i deploy this again on aws and on vercel, then i should be able to see in console hopefully, wht is console logged here? and in production 
// i should see the AWS link  and in development i should see the localhost link.

// Middleware to add the token to headers
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  //console.log('Token from localStorage:', token);
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
    graphQLErrors.forEach((err) => {
      console.error('GraphQL Error:', err);
      if (err.extensions.code === 'UNAUTHENTICATED') {
        console.log('Unauthenticated error detected, attempting token refresh...');
        return refreshToken().then((newTokens) => {
          // Check if new tokens were obtained
          if (newTokens) {
            localStorage.setItem('token', newTokens.token);
            localStorage.setItem('refreshToken', newTokens.refreshToken);
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                authorization: `Bearer ${newTokens.token}`,
              },
            }));
            return forward(operation);
          } else {
            handleLogout();
          }
        }).catch((refreshError) => {
          console.error('Token refresh failed:', refreshError);
          handleLogout();
        });
      }
    });
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
