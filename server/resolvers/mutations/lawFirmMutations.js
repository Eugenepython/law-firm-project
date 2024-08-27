// /resolvers/mutations/lawFirmMutations.js

import pool from '../../db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {
  sendAdminNotificationEmail,
  sendUserConfirmationEmail,
  sendUserRejectionEmail,
} from '../../email.js';

export const lawFirmMutations = {
  lawFirmSignUp: async (_, { username, lawFirm, email, password }) => {
    const client = await pool.connect();
    try {
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
      await sendAdminNotificationEmail(newUser, 'user');
      return newUser;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during lawFirmSignUp:', error);
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
  createCase: async (_, {
    lawFirmId,  // Accept lawFirmId as a parameter
    clientName,
    role,
    retainerDate,
    retainerDescription,
    feeEarner,
    incidentDate,
    courtReference,
    caseDescription,
    opposingParties,
    caseType,
    diseaseClaimType,
    yourReference
  }) => {
    const client = await pool.connect();
    try {
      // Validate required fields
      if (!lawFirmId || !clientName || !role || !retainerDate || !retainerDescription || !feeEarner || !incidentDate || !caseDescription || !caseType || !yourReference) {
        throw new Error('Required fields are missing');
      }
  
      const id = uuidv4();
      await client.query('BEGIN');
  
      // Parse opposingParties if necessary
      let opposingPartiesArray;
      if (Array.isArray(opposingParties)) {
        opposingPartiesArray = opposingParties;
      } else {
        try {
          opposingPartiesArray = JSON.parse(opposingParties);
        } catch (e) {
          throw new Error('Invalid format for opposingParties');
        }
      }
  
      // Log the data before insertion
      console.log('Inserting case with data:', {
        id, lawFirmId, clientName, role, retainerDate, retainerDescription, feeEarner, incidentDate,
        courtReference, caseDescription, opposingPartiesArray, caseType, diseaseClaimType, yourReference
      });
  
      const { rows } = await client.query(
        `INSERT INTO law_cases(
          id, law_firm_id, client_name, role, retainer_date, retainer_description, fee_earner, incident_date,
          court_reference, case_description, opposing_parties, case_type, disease_claim_type, your_reference
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          id, lawFirmId, clientName, role, retainerDate, retainerDescription, feeEarner, incidentDate,
          courtReference, caseDescription, opposingPartiesArray, caseType, diseaseClaimType, yourReference
        ]
      );
  
      // Log the inserted row
      console.log('Inserted row:', rows[0]);
  
      const returnedCase = {
        id: rows[0].id,
        lawFirmId: rows[0].law_firm_id,
        clientName: rows[0].client_name,
        role: rows[0].role,
        retainerDate: rows[0].retainer_date,
        retainerDescription: rows[0].retainer_description,
        feeEarner: rows[0].fee_earner,
        incidentDate: rows[0].incident_date,
        courtReference: rows[0].court_reference,
        caseDescription: rows[0].case_description,
        opposingParties: rows[0].opposing_parties,
        caseType: rows[0].case_type,
        diseaseClaimType: rows[0].disease_claim_type,
        yourReference: rows[0].your_reference,
      };
  
      await client.query('COMMIT');
      return returnedCase;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during createCase:', error.message);
      throw new Error('Failed to create case');
    } finally {
      client.release();
    }
  },
  createDisbursementPath: async (_, { caseId, lawFirmId, providerName, invoiceReferences, expertDiscipline }) => {
    const client = await pool.connect();
    try {
      // Validate required fields
      if (!caseId || !lawFirmId || !providerName || !invoiceReferences || !expertDiscipline) {
        throw new Error('Required fields are missing');
      }
  
      const id = uuidv4();  // Generate a new UUID for disbursement_path_id
      const createdAt = new Date();
  
      await client.query('BEGIN');
  
      const { rows } = await client.query(
        `INSERT INTO law_firm_disbs_paths(
          disbursement_path_id, case_id, law_firm_id, provider_name, invoice_references, expert_discipline, created_at, updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING *`,
        [id, caseId, lawFirmId, providerName, invoiceReferences, expertDiscipline, createdAt]
      );
  
      // Log the inserted row
      console.log('Inserted disbursement path:', rows[0]);
  
      await client.query('COMMIT');
  
      // Return an object that matches the DisbursementPath type in your GraphQL schema
      return {
        id: rows[0].disbursement_path_id,  // Mapping disbursement_path_id to id
        caseId: rows[0].case_id,
        lawFirmId: rows[0].law_firm_id,
        providerName: rows[0].provider_name,
        invoiceReferences: rows[0].invoice_references,
        expertDiscipline: rows[0].expert_discipline,
        createdAt: rows[0].created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during createDisbursementPath:', error.message);
      throw new Error('Failed to create disbursement path');
    } finally {
      client.release();
    }
  },
  
  
};

