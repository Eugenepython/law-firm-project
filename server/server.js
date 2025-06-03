console.log('Starting server setup');

import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables loaded');

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import typeDefs from './schema.js';
import cors from 'cors';
import resolvers from './resolvers/index.js';
import jwt from 'jsonwebtoken';
import verifyRoutes from './verifyRoutes.js';
import { authMutations } from './resolvers/mutations/authMutations.js';
import { AuthenticationError } from 'apollo-server-errors';
import serverless from 'serverless-http';

const app = express();

// ✅ CORS settings
const corsOptions = {
  //origin: '*',
  origin: function (origin, callback) {
     console.log("CORS origin received:", origin); 
    const allowed = [
      'http://localhost:3000',
      'https://disbursement-tracker.vercel.app',
      'https://disbursement-tracker.rubrikal.co.uk'
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Refresh-Token'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use('/api', verifyRoutes);

// ✅ Start Apollo Server function
async function startApolloServer() {
  console.log("Starting Apollo Server setup...");

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  console.log("Apollo Server started successfully!");

  app.use(express.json()); // Required for parsing JSON bodies
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      console.log("Context function called");

      let token = req.headers.authorization || '';
      if (token.startsWith('Bearer ')) {
        token = token.slice(7).trimLeft();
      }

      let userId = null;
      let newToken = null;
      let refreshToken = req.headers['x-refresh-token'];

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        } catch (err) {
          if (err.name === 'TokenExpiredError' && refreshToken) {
            try {
              const refreshResult = await authMutations.refreshToken(null, { token: refreshToken });
              newToken = refreshResult.token;
              refreshToken = refreshResult.refreshToken;
              const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
              userId = decoded.userId;
            } catch (refreshError) {
              throw new AuthenticationError('Token expired and could not be refreshed');
            }
          } else {
            throw new AuthenticationError('Invalid or expired token');
          }
        }
      }

      return { userId, newToken, refreshToken };
    },
  }));

  app.get('/', (req, res) => {
    res.status(200).json({ message: 'GraphQL API is running' });
  });
}

// ✅ Ensure the server starts before exporting the handler
let serverPromise = startApolloServer();

// ✅ Unified execution for AWS Lambda & Local Mode
// ✅ Unified execution for AWS Lambda & Local Mode
let handler;

if (process.env.AWS_EXECUTION_ENV) {
  console.log("Running in AWS Lambda mode...");
  handler = async (event, context) => {
    await serverPromise; // Ensure the Apollo Server is started before handling the request
    const handler = serverless(app);
    return handler(event, context);
  };
} else {
  console.log("Running in Local mode...");
  startApolloServer().then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}/graphql`);
    });
  });
}

export { handler };


