//server.js

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import http from 'http';
import { gql } from 'graphql-tag';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import pg from 'pg';
import crypto from 'crypto';

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('BASE_URL:', process.env.BASE_URL);

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Define your GraphQL schema
const typeDefs = gql`
  type Query {
    hello: String
    getUsers: [User]
    getProviders: [Provider]
  }

  type Mutation {
      lawFirmSignUp(username: String!, lawFirm: String!, email: String!, password: String!): User
    providerSignUp(username: String!, disbFirm: String!, email: String!, password: String!): Provider
    verifyUser(id: ID!): User
    verifyProvider(id: ID!): Provider
    acceptUser(id: ID!): User
    acceptProviderUser(id: ID!): Provider
    rejectUser(id: ID!): User
    rejectProviderUser(id: ID!): Provider
    requestPasswordReset(email: String!): Boolean
    resetPassword(token: String!, newPassword: String!): Boolean
    requestUsername(email: String!): Boolean
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
`;

// Define resolvers for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
    getUsers: async () => {
      const { rows } = await pool.query('SELECT * FROM law_firm_users');
      return rows;
    },
    getProviders: async () => {
      const { rows } = await pool.query('SELECT * FROM disb_provider_users');
      return rows;
    },
  },
  Mutation: {
    lawFirmSignUp: async (_, { username, lawFirm, email, password }) => {
      const client = await pool.connect();
      try {
        // Check if the username or email already exists
        const { rows: existingUsers } = await client.query('SELECT * FROM law_firm_users WHERE username = $1 OR email = $2', [username, email]);
        if (existingUsers.length > 0) {
          throw new Error('Username or email already exists');
        }

        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const newUser = {
          id,
          username,
          lawFirm,
          email,
          password: hashedPassword,
          status: 'pending',
          verificationToken,
        };

        await client.query('BEGIN');
        await client.query(
          'INSERT INTO law_firm_users(id, username, law_firm, email, password, status, verification_token) VALUES($1, $2, $3, $4, $5, $6, $7)',
          [id, username, lawFirm, email, hashedPassword, 'pending', verificationToken]
        );
        await client.query('COMMIT');

        await sendAdminNotificationEmail(newUser, 'user'); // Correctly specify the type as 'user'
        return newUser;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during lawFirmSignUp:', error);
        throw error;
      } finally {
        client.release();
      }
    },
    providerSignUp: async (_, { username, disbFirm, email, password }) => {
      const client = await pool.connect();
      try {
        // Check if the username or email already exists
        const { rows: existingProviders } = await client.query('SELECT * FROM disb_provider_users WHERE username = $1 OR email = $2', [username, email]);
        if (existingProviders.length > 0) {
          throw new Error('Username or email already exists');
        }

        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const newProvider = {
          id,
          username,
          disbFirm,
          email,
          password: hashedPassword,
          status: 'pending',
          verificationToken,
        };

        await client.query('BEGIN');
        await client.query(
          'INSERT INTO disb_provider_users(id, username, disb_firm, email, password, status, verification_token) VALUES($1, $2, $3, $4, $5, $6, $7)',
          [id, username, disbFirm, email, hashedPassword, 'pending', verificationToken]
        );
        await client.query('COMMIT');

        await sendAdminNotificationEmail(newProvider);
        return newProvider;
      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error during providerSignUp:', error);
        throw error;
      } finally {
        client.release();
      }
    },
    verifyUser: async (_, { id }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'UPDATE law_firm_users SET status = $1 WHERE id = $2 RETURNING *',
          ['verified', id]
        );
        await client.query('COMMIT');

        if (rows.length > 0) {
          return rows[0];
        } else {
          throw new Error('User not found');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    verifyProvider: async (_, { id }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'UPDATE disb_provider_users SET status = $1 WHERE id = $2 RETURNING *',
          ['verified', id]
        );
        await client.query('COMMIT');

        if (rows.length > 0) {
          return rows[0];
        } else {
          throw new Error('Provider not found');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    acceptUser: async (_, { id }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'UPDATE law_firm_users SET status = $1 WHERE id = $2 RETURNING *',
          ['accepted', id]
        );
        await client.query('COMMIT');

        if (rows.length > 0) {
          await sendUserConfirmationEmail(rows[0], 'law_firm');
          return rows[0];
        } else {
          throw new Error('User not found');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    acceptProviderUser: async (_, { id }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'UPDATE disb_provider_users SET status = $1 WHERE id = $2 RETURNING *',
          ['accepted', id]
        );
        await client.query('COMMIT');

        if (rows.length > 0) {
          await sendUserConfirmationEmail(rows[0], 'disb_provider'); // Pass 'disb_provider' as the user type
          return rows[0];
        } else {
          throw new Error('User not found');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    rejectUser: async (_, { id }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'UPDATE law_firm_users SET status = $1 WHERE id = $2 RETURNING *',
          ['rejected', id]
        );
        await client.query('COMMIT');

        if (rows.length > 0) {
          await sendUserRejectionEmail(rows[0]);
          return rows[0];
        } else {
          throw new Error('User not found');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    rejectProviderUser: async (_, { id }) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'UPDATE disb_provider_users SET status = $1 WHERE id = $2 RETURNING *',
          ['rejected', id]
        );
        await client.query('COMMIT');

        if (rows.length > 0) {
          await sendUserRejectionEmail(rows[0]);
          return rows[0];
        } else {
          throw new Error('Provider not found');
        }
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    requestPasswordReset: async (_, { email }) => {
      const client = await pool.connect();
      try {
        const { rows } = await client.query('SELECT * FROM law_firm_users WHERE email = $1', [email]);
        if (rows.length > 0) {
          const user = rows[0];
          const token = crypto.randomBytes(20).toString('hex');
          const tokenExpiry = new Date();
          tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token expires in 1 hour

          await client.query(
            'UPDATE law_firm_users SET password_reset_token = $1, token_expiry = $2 WHERE email = $3',
            [token, tokenExpiry, email]
          );

          await sendPasswordResetEmail(user, token);
          return true;
        } else {
          throw new Error('Email not found');
        }
      } catch (error) {
        console.error('Error requesting password reset:', error);
        throw error;
      } finally {
        client.release();
      }
    },
    resetPassword: async (_, { token, newPassword }) => {
      const client = await pool.connect();
      try {
        const { rows } = await client.query(
          'SELECT * FROM law_firm_users WHERE password_reset_token = $1 AND token_expiry > NOW()',
          [token]
        );
        if (rows.length > 0) {
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          await client.query(
            'UPDATE law_firm_users SET password = $1, password_reset_token = NULL, token_expiry = NULL WHERE password_reset_token = $2',
            [hashedPassword, token]
          );
          return true;
        } else {
          throw new Error('Invalid or expired token');
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
      } finally {
        client.release();
      }
    },
    requestUsername: async (_, { email }) => {
      const client = await pool.connect();
      try {
        const { rows } = await client.query('SELECT * FROM law_firm_users WHERE email = $1', [email]);
        if (rows.length > 0) {
          const user = rows[0];
          await sendUsernameEmail(user);
          return true;
        } else {
          throw new Error('Email not found');
        }
      } catch (error) {
        console.error('Error requesting username:', error);
        throw error;
      } finally {
        client.release();
      }
    },
  },
};


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendAdminNotificationEmail = async (user, type) => {
  console.log('BASE_URL:', process.env.BASE_URL); // Debugging
  const entity = type === 'user' ? 'Law Firm User' : 'Disbursement Provider';
  const verificationLink = `${process.env.BASE_URL}/verify?token=${user.verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: 'New User Sign-Up',
    text: `A new ${entity.toLowerCase()} has signed up. Details:\n\nUsername: ${user.username}\nEmail: ${user.email}\n${entity}: ${user.lawFirm || user.disbFirm}\n\nVerification Link: ${verificationLink}\n\nPlease log in to the admin panel to verify the user.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Error sending admin notification email:', error);
  }
};  

const sendUserConfirmationEmail = async (user, type) => {
  const entity = type === 'user' ? 'Law Firm User' : 'Disbursement Provider';
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Account Accepted',
    text: `Hello ${user.username},\n\nYour ${entity.toLowerCase()} account has been accepted. You can now log in.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('User confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending user confirmation email:', error);
  }
};


const sendUserRejectionEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Account Rejected',
    text: `Hello ${user.username},\n\nWe regret to inform you that your account has been rejected.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('User rejection email sent successfully');
  } catch (error) {
    console.error('Error sending user rejection email:', error);
  }
};

const sendPasswordResetEmail = async (user, token) => {
  const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Password Reset Request',
    text: `You have requested a password reset. Click the link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

const sendUsernameEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Username Retrieval Request',
    text: `Your username is: ${user.username}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Username email sent successfully');
  } catch (error) {
    console.error('Error sending username email:', error);
  }
};

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

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Verification endpoint
// Verification endpoint

app.get('/verify', async (req, res) => {
  const { token } = req.query;

  console.log('Verification token received:', token); // Debugging

  if (!token) {
    console.log('No token provided'); // Debugging
    return res.status(400).send('Invalid verification link');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check law_firm_users
    let { rows } = await client.query(
      'UPDATE law_firm_users SET status = $1 WHERE verification_token = $2 RETURNING *',
      ['accepted', token]
    );

    if (rows.length === 0) {
      // Check disb_provider_users if not found in law_firm_users
      ({ rows } = await client.query(
        'UPDATE disb_provider_users SET status = $1 WHERE verification_token = $2 RETURNING *',
        ['accepted', token]
      ));
    }

    await client.query('COMMIT');

    if (rows.length > 0) {
      console.log('User status updated successfully');
      res.send('Your account has been verified and accepted.');
    } else {
      console.log('Invalid or expired token'); // Debugging
      res.status(400).send('Invalid or expired verification link');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error verifying user:', error);
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

















// Password reset endpoint
app.get('/reset-password', async (req, res) => {
  const { token } = req.query;

  console.log('Password reset token received:', token); // Debugging

  if (!token) {
    console.log('No token provided'); // Debugging
    return res.status(400).send('Invalid password reset link');
  }

  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      'SELECT * FROM law_firm_users WHERE password_reset_token = $1 AND token_expiry > NOW()',
      [token]
    );

    if (rows.length > 0) {
      res.send('You can now reset your password.');
    } else {
      console.log('Invalid or expired token'); // Debugging
      res.status(400).send('Invalid or expired password reset link');
    }
  } catch (error) {
    console.error('Error validating password reset token:', error);
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

// Start the Apollo server
async function startApolloServer() {
  await server.start();
  app.use('/graphql', bodyParser.json(), expressMiddleware(server));

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

startApolloServer();
