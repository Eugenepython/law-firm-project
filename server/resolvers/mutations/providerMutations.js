// /resolvers/mutations/providerMutations.js

import pool from '../../db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  sendAdminNotificationEmail,
  sendUserConfirmationEmail,
  sendUserRejectionEmail,
} from '../../email.js';

export const providerMutations = {
  providerSignUp: async (_, { username, disbFirm, email, password }) => {
    const client = await pool.connect();
    try {
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
        await sendUserConfirmationEmail(rows[0], 'disb_provider');
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
};
