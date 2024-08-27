// /resolvers/mutations/authMutations.js

import pool from '../../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


export const authMutations = {
  lawFirmLogin: async (_, { username, password }) => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM law_firm_users WHERE username = $1', [username]);
      if (rows.length === 0) {
        throw new Error('User not found');
      }
      const user = rows[0];
      if (user.status === 'pending') {
        throw new Error('Email needs verification');
      }

      if (user.status !== 'accepted') {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Wrong password');
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' }); // Expires in 20 minutes
      return {
        token,
        user,
      };
    } catch (error) {
      console.error('Error during lawFirmLogin:', error);
      throw new Error(error.message);
    } finally {
      client.release();
    }
  },

  providerLogin: async (_, { username, password }) => {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT * FROM disb_provider_users WHERE username = $1', [username]);
      if (rows.length === 0) {
        throw new Error('User not found');
      }

      const user = rows[0];

      if (user.status === 'pending') {
        throw new Error('Email needs verification');
      }

      if (user.status !== 'accepted') {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Wrong password');
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '10m' });
      return {
        token,
        user,
      };
    } catch (error) {
      console.error('Error during providerLogin:', error);
      throw new Error(error.message);
    } finally {
      client.release();
    }
  },
  refreshToken: async (_, { token }) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Invalid token');
    }
  },
  
};
