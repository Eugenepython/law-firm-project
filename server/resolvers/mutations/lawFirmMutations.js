// /resolvers/mutations/lawFirmMutations.js


import pool from '../../db.js';
import { v4 as uuidv4 } from 'uuid';
//import bcrypt from 'bcrypt';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  sendAdminNotificationEmail,
  sendUserConfirmationEmail,
  sendUserRejectionEmail,
  sendInviteDetailsToAdmin,
  sendLawFirmPasswordResetEmail
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

  createDisbursementPath: async (_, { caseId, lawFirmId, providerName, invoiceReferences, expertDiscipline, nameOfExpert, disbProviderId }) => {
    const client = await pool.connect();
    try {
      // Validate required fields, skip invoiceReferences and nameOfExpert if optional
      if (!caseId || !lawFirmId || !providerName || !expertDiscipline || !disbProviderId) {
        throw new Error('Required fields are missing');
      }
  
      const id = uuidv4();  // Generate a new UUID for disbursement_path_id
      const createdAt = new Date();
      await client.query('BEGIN');
  
      const { rows } = await client.query(
        `INSERT INTO law_firm_disbs_paths(
          disbursement_path_id, case_id, law_firm_id, provider_name, invoice_references, expert_discipline, name_of_expert, disb_provider_id, created_at, updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
        RETURNING *`,
        [id, caseId, lawFirmId, providerName, invoiceReferences || null, expertDiscipline, nameOfExpert || null, disbProviderId, createdAt]
      );
  
      console.log('Inserted disbursement path:', rows[0]);
      await client.query('COMMIT');
  
      return {
        id: rows[0].disbursement_path_id,         // Mapping disbursement_path_id to id
        caseId: rows[0].case_id,
        lawFirmId: rows[0].law_firm_id,
        providerName: rows[0].provider_name,
        invoiceReferences: rows[0].invoice_references,
        expertDiscipline: rows[0].expert_discipline,
        nameOfExpert: rows[0].name_of_expert,
        disbProviderId: rows[0].disb_provider_id, // Return disbProviderId
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
  



  createPotentialDisbursement: async (_, args) => {
    const {
      disbursementId,
      caseId,
      lawFirmId,
      report,
      lawFirmAgreesToPay,
      priceType,
      priceValue,
      priceMin,
      priceMax,
      disbProviderId,
      expertDiscipline,
      providerName,
      nameOfExpert,
      disbProviderAccepts = false, // ✅ Default false
      lawFirmRetractsBeforeDisbProviderAccepts = false, // ✅ Default false
      proposalsRejectedByProvider = false, // ✅ Default false
      proposalsAbandonedByProvider = false, // ✅ Newly added default false
      clientName
    } = args;
    const client = await pool.connect();
    try {
      if (!disbursementId || !caseId || !lawFirmId || !report || lawFirmAgreesToPay === undefined) {
        throw new Error("Required fields are missing");
      }
      const createdAt = new Date(); 
      await client.query("BEGIN");
      const { rows } = await client.query(
        `INSERT INTO potential_disbursements (
          disbursement_id, case_id, law_firm_id, report, law_firm_agrees_to_pay,
          price_type, price_value, price_min, price_max, created_at,
          disb_provider_id, expert_discipline, provider_name, name_of_expert,
          disbprovider_accepts, law_firm_retracts_before_disbprovider_accepts, 
          proposals_rejected_by_provider, proposals_abandoned_by_provider, client_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
          COALESCE($15, FALSE), COALESCE($16, FALSE), COALESCE($17, FALSE), 
          COALESCE($18, FALSE), $19)
        RETURNING *`, 
        [
          disbursementId,
          caseId,
          lawFirmId,
          report,
          lawFirmAgreesToPay,
          priceType,
          priceValue || null,
          priceMin || null,
          priceMax || null,
          createdAt,
          disbProviderId,
          expertDiscipline,
          providerName,
          nameOfExpert || null,
          disbProviderAccepts, 
          lawFirmRetractsBeforeDisbProviderAccepts, 
          proposalsRejectedByProvider,
          proposalsAbandonedByProvider, // ✅ New field explicitly set
          clientName || null
        ]
      );
      await client.query("COMMIT");
      return {
        id: rows[0].id,
        disbursementId: rows[0].disbursement_id,
        caseId: rows[0].case_id,
        lawFirmId: rows[0].law_firm_id,
        report: rows[0].report,
        lawFirmAgreesToPay: rows[0].law_firm_agrees_to_pay ?? false,
        priceType: rows[0].price_type,
        priceValue: rows[0].price_value,
        priceMin: rows[0].price_min,
        priceMax: rows[0].price_max,
        createdAt: rows[0].created_at,
        disbProviderId: rows[0].disb_provider_id,
        expertDiscipline: rows[0].expert_discipline,
        providerName: rows[0].provider_name,
        nameOfExpert: rows[0].name_of_expert,
        disbProviderAccepts: rows[0].disbprovider_accepts ?? false,
        lawFirmRetractsBeforeDisbProviderAccepts: rows[0].law_firm_retracts_before_disbprovider_accepts ?? false,
        proposalsRejectedByProvider: rows[0].proposals_rejected_by_provider ?? false,
        proposalsAbandonedByProvider: rows[0].proposals_abandoned_by_provider ?? false, // ✅ Ensure it's always false or true
        clientName: rows[0].client_name
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error during createPotentialDisbursement:", error.message);
      throw new Error("Failed to create potential disbursement");
    } finally {
      client.release();
    }
  },




  createDisbProviderWithInvite: async (_, { lawFirmId, providerName, providerEmail, expertName, expertDiscipline, caseId }) => {
    const client = await pool.connect();
    try {
      console.log('Starting the createDisbProviderWithInvite mutation');
      await client.query('BEGIN');
  
      const id = uuidv4();
      const verificationToken = crypto.randomBytes(20).toString('hex');
      const tempPassword = "password"; // Use "password" as a simple placeholder
  
      const newProvider = {
        id,
        username: providerName,
        email: providerEmail,
        status: 'pending',
        verificationToken,
        disbFirm: 'Unverified Firm',
        password: tempPassword, // Temporary password
      };
  
      // Insert the new provider
      await client.query(
        'INSERT INTO disb_provider_users(id, username, email, status, verification_token, disb_firm, password) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [id, providerName, providerEmail, 'pending', verificationToken, 'Unverified Firm', tempPassword]
      );
  
      const disbursementPathId = uuidv4();
      const createdAt = new Date();
  
      // Insert disbursement path
      await client.query(
        `INSERT INTO law_firm_disbs_paths(
          disbursement_path_id, law_firm_id, case_id, provider_name, expert_discipline, name_of_expert, created_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [disbursementPathId, lawFirmId, caseId, providerName, expertDiscipline, expertName, createdAt]
      );
  
      await client.query('COMMIT');
  
      // Generate the verification link
      const verificationLink = `${process.env.BASE_URL}/verify-invite?token=${verificationToken}`;
      console.log('Generated verification link:', verificationLink);  // Log the link for debugging
  
      // Send the invite email with the verification link
      await sendInviteDetailsToAdmin(newProvider, verificationLink);
  
      console.log('Disbursement path created and email sent successfully');
  
      return {
        id: disbursementPathId,
        lawFirmId,
        providerName,
        providerEmail,
        expertName,
        expertDiscipline,
        createdAt,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during createDisbursementWithInvite:', error);
      throw new Error('Failed to invite provider and create disbursement path');
    } finally {
      client.release();
    }
  },
  





  // Law firm invites a provider with a pending status
  inviteProvider: async (_, { username, email }) => {
    const client = await pool.connect();
    try {
      const { rows: existingProviders } = await client.query(
        'SELECT * FROM disb_provider_users WHERE username = $1 OR email = $2',
        [username, email]
      );
      if (existingProviders.length > 0) {
        throw new Error('Provider with this username or email already exists');
      }
      const id = uuidv4();
      const verificationToken = crypto.randomBytes(20).toString('hex');
      const newProvider = {
        id,
        username,
        email,
        status: 'pending',
        verificationToken,
        disbFirm: 'Unverified Firm', // Default firm name until updated
      };
      await client.query('BEGIN');
      await client.query(
        'INSERT INTO disb_provider_users(id, username, email, status, verification_token, disb_firm) VALUES($1, $2, $3, $4, $5, $6)',
        [id, username, email, 'pending', verificationToken, newProvider.disbFirm]
      );
      await client.query('COMMIT');
      // Send email with provider details to admin for manual invitation
      await sendInviteDetailsToAdmin(newProvider);
      return newProvider;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during inviteProvider:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  // New mutation: Complete the provider profile after invitation
 // New mutation: Complete the provider profile after invitation
// New mutation: Complete the provider profile after invitation


completeProviderProfile: async (_, { verificationToken, disbFirm, password }) => {
  const client = await pool.connect();
  try {
    console.log('Received verificationToken:', verificationToken);
    console.log('Received disbFirm:', disbFirm);
    console.log('Received password:', password);
    const { rows: provider } = await client.query(
      'SELECT * FROM disb_provider_users WHERE verification_token = $1 AND status = $2',
      [verificationToken, 'pending']
    );
    if (provider.length === 0) {
      throw new Error('Invalid or expired verification token.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query('BEGIN');
    await client.query(
      'UPDATE disb_provider_users SET password = $1, disb_firm = $2, status = $3, verification_token = NULL WHERE id = $4',
      [hashedPassword, disbFirm, 'accepted', provider[0].id]
    );
    await client.query('COMMIT');
    return {
      success: true,
      message: 'Profile completed and provider verified.',
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during completeProviderProfile:', error);  // Log the error as well
    throw error;
  } finally {
    client.release();
  }
},


retractAgreementToPay: async (_, { disbursementId }) => {
  console.log("Executing retractAgreementToPay resolver:", disbursementId);
  const client = await pool.connect();
  try {
    console.log("Checking if disbursement exists and provider has accepted...");
    const { rows: disbursement } = await client.query(
      'SELECT disbprovider_accepts FROM potential_disbursements WHERE id = $1',
      [disbursementId] // Now using "id" instead of "disbursement_id"
    );
    console.log("Disbursement fetched:", disbursement);
    if (disbursement.length === 0) {
      console.error("Disbursement not found!");
      return false; // Return false if the disbursement is not found
    }
    if (disbursement[0].disbprovider_accepts) {
      console.error("Disbursement already accepted, cannot retract!");
      return false; // Return false if provider has already accepted
    }
    console.log("Starting transaction to retract agreement...");
    await client.query('BEGIN');
    const updateResult = await client.query(
      'UPDATE potential_disbursements SET law_firm_retracts_before_disbprovider_accepts = $1 WHERE id = $2 RETURNING *',
      [true, disbursementId] // Now using "id" instead of "disbursement_id"
    );
    console.log("Update result:", updateResult.rows);
    if (updateResult.rowCount === 0) {
      console.error("No rows updated, something went wrong!");
      await client.query('ROLLBACK');
      return false;
    }
    await client.query('COMMIT');
    console.log("RetractAgreementToPay successfully updated!");
    return true; // Return true on success
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error during retractAgreementToPay:", error);
    return false;
  } finally {
    client.release();
  }
},


editAgreementToPay: async (_, { disbursementId, report, lawFirmAgreesToPay, priceType, priceValue, priceMin, priceMax }) => {
  console.log("Executing editAgreementToPay resolver:", { disbursementId, report, lawFirmAgreesToPay, priceType, priceValue, priceMin, priceMax });
  const client = await pool.connect(); // ✅ Get a connection from PostgreSQL pool
  try {
    console.log("Checking if disbursement exists...");
    const { rows: existingDisbursement } = await client.query(
      'SELECT * FROM potential_disbursements WHERE id = $1',
      [disbursementId]
    );
    if (existingDisbursement.length === 0) {
      console.error("❌ Disbursement not found!");
      return null; // Return null if the disbursement is not found
    }
    console.log("✅ Disbursement exists, proceeding with update...");
    await client.query('BEGIN');
    const updateQuery = `
      UPDATE potential_disbursements 
      SET 
        report = $1, 
        law_firm_agrees_to_pay = $2, 
        price_type = $3, 
        price_value = $4, 
        price_min = $5, 
        price_max = $6
      WHERE id = $7 
      RETURNING *;
    `;
    const updateValues = [
      report, 
      lawFirmAgreesToPay, 
      priceType, 
      priceValue, 
      priceMin, 
      priceMax, 
      disbursementId
    ];
    const { rows: updatedDisbursement } = await client.query(updateQuery, updateValues);
    if (updatedDisbursement.length === 0) {
      console.error("❌ No rows updated, something went wrong!");
      await client.query('ROLLBACK');
      return null;
    }
    await client.query('COMMIT'); // ✅ Commit transaction
    console.log("✅ editAgreementToPay successfully updated:", updatedDisbursement[0]);
    return {
      id: updatedDisbursement[0].id,
      report: updatedDisbursement[0].report,
      lawFirmAgreesToPay: updatedDisbursement[0].law_firm_agrees_to_pay,  // ✅ Fix field mapping
      priceType: updatedDisbursement[0].price_type,
      priceValue: updatedDisbursement[0].price_value,
      priceMin: updatedDisbursement[0].price_min,
      priceMax: updatedDisbursement[0].price_max
    };
  } catch (error) {
    await client.query('ROLLBACK'); // ❌ Rollback in case of an error
    console.error("❌ Error during editAgreementToPay:", error);
    return null;
  } finally {
    client.release(); // ✅ Release client back to the pool
  }
},


lawFirmRequestPasswordReset : async (_, { email }) => {
  if (!pool) {
    console.error("❌ Database connection pool is NOT defined.");
    throw new Error("Database connection is unavailable.");
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: users } = await client.query(
      'SELECT id FROM law_firm_users WHERE email = $1',
      [email]
    );
    if (users.length === 0) {
      console.error("❌ No law firm user found with this email.");
      throw new Error("No law firm user found with this email.");
    }
    console.log("✅ Law firm user exists, generating reset token...");
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiration

    // Store reset token in database
    await client.query(
      `UPDATE law_firm_users
       SET password_reset_token = $1, token_expiry = $2
       WHERE email = $3`,
      [resetToken, tokenExpiry, email]
    );
    await client.query('COMMIT');
    const resetLink = `http://localhost:3000/lawfirm-reset-password?token=${resetToken}`;
    console.log("✅ Law firm password reset link generated:", resetLink);
    await sendLawFirmPasswordResetEmail(email, resetLink);
    return { success: true, message: "Password reset link sent to email." };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Law firm password reset error:", error.message);
    throw error;
  } finally {
    client.release();
  }
},




lawFirmResetPassword : async (_, { token, newPassword }) => {
  if (!pool) {
    console.error("❌ Database connection pool is NOT defined.");
    throw new Error("Database connection is unavailable.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: users } = await client.query(
      "SELECT id FROM law_firm_users WHERE password_reset_token = $1 AND token_expiry > NOW()",
      [token]
    );
    if (users.length === 0) {
      console.error("❌ Invalid or expired reset token.");
      throw new Error("Invalid or expired reset token.");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query(
      "UPDATE law_firm_users SET password = $1, password_reset_token = NULL, token_expiry = NULL WHERE id = $2",
      [hashedPassword, users[0].id]
    );
    await client.query("COMMIT");
    console.log("✅ Password reset successfully for law firm user:", users[0].id);
    return { success: true, message: "Password reset successful." };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Law firm password reset error:", error.message);
    throw error;
  } finally {
    client.release();
  }
}






};



