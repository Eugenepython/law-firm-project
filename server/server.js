//server.js

console.log('Starting server setup');

import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables loaded');

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import http from 'http';
import typeDefs from './schema.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import resolvers from './resolvers/index.js';
import jwt from 'jsonwebtoken';
import verifyRoutes from './verifyRoutes.js'; 
import { authMutations } from './resolvers/mutations/authMutations.js';
import { AuthenticationError } from 'apollo-server-errors';

// Create an Express application
const app = express();
const httpServer = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from your frontend's origin
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
console.log('Middleware applied');

app.use('/api', verifyRoutes);

async function startApolloServer() {
  console.log("Starting server setup");

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  console.log("Apollo Server started");

  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      console.log("Context function called");
  
      let token = req.headers.authorization || '';
      if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trimLeft();  // Remove the "Bearer " prefix
      }
      console.log("Authorization header without Bearer:", token);
  
      let userId = null;
      let newToken = null;
      let refreshToken = req.headers['x-refresh-token'];
  
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("Decoded token:", decoded);
          userId = decoded.userId;
        } catch (err) {
          if (err.name === 'TokenExpiredError' && refreshToken) {
            console.log('Token expired, attempting to refresh');
            try {
              const refreshResult = await authMutations.refreshToken(null, { token: refreshToken });
              newToken = refreshResult.token;
              refreshToken = refreshResult.refreshToken;
              const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
              userId = decoded.userId;
              console.log('Token refreshed successfully');
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              throw new AuthenticationError('Token expired and could not be refreshed');
            }
          } else {
            console.error('Token verification failed:', err);
            throw new AuthenticationError('Invalid or expired token');
          }
        }
      }
  
      return { userId, newToken, refreshToken };
    },
  }));
  

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

startApolloServer().catch(err => {
  console.error('Error starting Apollo Server:', err);
  process.exit(1); // Exit the process if the server fails to start
});

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

