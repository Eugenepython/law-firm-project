// /resolvers/mutations/providerMutations.js

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
  sendProviderPasswordResetEmail
} from '../../email.js';

export const providerMutations = {
  // Sign up for providers who register themselves
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

  // Verify the provider account
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

  // Accept the provider after verification
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

  // Reject the provider
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


// Add this mutation for invited providers to update their profile
completeProviderProfile: async (_, { verificationToken, username, disbFirm, password }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: existingProviders } = await client.query(
      'SELECT * FROM disb_provider_users WHERE verification_token = $1',
      [verificationToken]
    );
    if (existingProviders.length === 0) {
      throw new Error('Invalid or expired verification token');
    }
    const provider = existingProviders[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      `UPDATE disb_provider_users
      SET username = $1, disb_firm = $2, password = $3, status = $4, verification_token = NULL
      WHERE verification_token = $5
      RETURNING *`,
      [username, disbFirm, hashedPassword, 'accepted', verificationToken]
    );
    await client.query('COMMIT');
    if (rows.length > 0) {
      // Optionally send a confirmation email to the provider
      await sendUserConfirmationEmail(rows[0], 'disb_provider');
      return rows[0];
    } else {
      throw new Error('Provider not found or could not be updated');
    }
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback transaction if any error occurs
    console.error('Error during profile completion:', error);
    throw error;
  } finally {
    client.release(); // Release the client connection
  }
},


providerRequestPasswordReset: async (_, { email }) => {
  if (!pool) {
    console.error("❌ Database connection pool is NOT defined.");
    throw new Error("Database connection is unavailable.");
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: users } = await client.query(
      'SELECT id FROM disb_provider_users WHERE email = $1',
      [email]
    );
    if (users.length === 0) {
      console.error("❌ No provider found with this email.");
      throw new Error("No provider found with this email.");
    }
    console.log("✅ User exists, generating reset token...");
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 3600000);
    await client.query(
      `UPDATE disb_provider_users
       SET password_reset_token = $1, token_expiry = $2
       WHERE email = $3`,
      [resetToken, tokenExpiry, email]
    );
    await client.query('COMMIT');
    //const resetLink = `http://localhost:3000/provider-reset-password?token=${resetToken}`;
    const resetLink = `${process.env.FRONTEND_URL}/provider-reset-password?token=${resetToken}`;
    console.log("✅ Reset link generated:", resetLink);
    await sendProviderPasswordResetEmail(email, resetLink);
    return { success: true, message: "Password reset link sent to email." };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Provider password reset error:", error.message);
    throw error;
  } finally {
    client.release();
  }
},


providerResetPassword: async (_, { token, newPassword }) => {
  if (!pool) {
    console.error("❌ Database connection pool is NOT defined.");
    throw new Error("Database connection is unavailable.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: users } = await client.query(
      "SELECT id FROM disb_provider_users WHERE password_reset_token = $1 AND token_expiry > NOW()",
      [token]
    );
    if (users.length === 0) {
      console.error("❌ Invalid or expired reset token.");
      throw new Error("Invalid or expired reset token.");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await client.query(
      "UPDATE disb_provider_users SET password = $1, password_reset_token = NULL, token_expiry = NULL WHERE id = $2",
      [hashedPassword, users[0].id]
    );
    await client.query("COMMIT");
    console.log("✅ Password reset successfully for provider:", users[0].id);
    return { success: true, message: "Password reset successful." };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Password reset error:", error.message);
    throw error;
  } finally {
    client.release();
  }
},


     

providerAcceptsDisbursement: async (_, { id }) => {
  if (!pool) {
    console.error("❌ Database connection pool is NOT defined.");
    throw new Error("Database connection is unavailable.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: existingRows } = await client.query(
      `SELECT id, disbprovider_accepts 
       FROM potential_disbursements 
       WHERE id = $1`,
      [id]
    );
    console.log("📌 Found Disbursement:", existingRows[0]);
    if (!existingRows.length) {
      console.error("❌ Disbursement not found in the database.");
      throw new Error("Disbursement not found.");
    }
    if (existingRows[0].disbprovider_accepts === true) {
      console.error("❌ Cannot accept. Disbursement is already accepted.");
      throw new Error("Cannot accept. Disbursement is already accepted.");
    }
    const { rows } = await client.query(
      `UPDATE potential_disbursements 
       SET disbprovider_accepts = TRUE 
       WHERE id = $1 
       RETURNING id, disbprovider_accepts AS "disbProviderAccepts"`,
      [id]
    );
    if (!rows.length) {
      console.error("❌ Failed to update disbursement.");
      throw new Error("Failed to update disbursement.");
    }
    await client.query("COMMIT");
    console.log("✅ Disbursement accepted successfully:", rows[0]);
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error updating disbursement:", error.message);
    throw new Error(`Error updating disbursement: ${error.message}`);
  } finally {
    client.release();
  }
},














providerRejectsDisbursement: async (_, { id }) => {
  if (!pool) {
    console.error("❌ Database connection pool is NOT defined.");
    throw new Error("Database connection is unavailable.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: existingRows } = await client.query(
      `SELECT id, name_of_expert, disbprovider_accepts, COALESCE(proposals_rejected_by_provider, FALSE) AS proposalsRejectedByProvider
       FROM potential_disbursements 
       WHERE id = $1`,
      [id]
    );
    console.log("🔎 Existing Record:", existingRows);
    if (!existingRows.length) {
      console.warn(`⚠️ Disbursement with ID ${id} not found.`);
      throw new Error(`Disbursement with ID ${id} not found.`);
    }
    const { disbprovider_accepts, proposalsRejectedByProvider } = existingRows[0];
    if (disbprovider_accepts) {
      throw new Error("❌ Cannot reject. Disbursement has already been accepted.");
    }
    if (proposalsRejectedByProvider === true) {
      console.log("⚠️ Disbursement has already been rejected.");
      await client.query("ROLLBACK");
      return {
        id,
        proposalsRejectedByProvider: true, // ✅ Ensure GraphQL receives a valid boolean
      };
    }
    console.log(`🔄 Updating proposals_rejected_by_provider for ID "${id}"`);
    const { rows } = await client.query(
      `UPDATE potential_disbursements 
       SET proposals_rejected_by_provider = TRUE 
       WHERE id = $1 
       RETURNING id, name_of_expert, COALESCE(proposals_rejected_by_provider, FALSE) AS "proposalsRejectedByProvider"`,
      [id]
    );
    console.log("🔄 Updated Row:", rows);
    if (!rows.length) {
      console.warn(`⚠️ Update failed for ID "${id}".`);
      throw new Error("Update failed. No records were modified.");
    }
    await client.query("COMMIT");
    return {
      id: rows[0].id,
      proposalsRejectedByProvider: rows[0].proposalsRejectedByProvider, // ✅ Guaranteed to be true/false
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Database Error:", error.message);
    throw new Error(`Database Error: ${error.message}`);
  } finally {
    client.release();
  }
},


providerAbandonsDisbursement: async (_, { id }) => {
  if (!pool) {
    console.error("❌ Database connection pool is NOT defined.");
    throw new Error("Database connection is unavailable.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch existing record
    const { rows: existingRows } = await client.query(
      `SELECT id, name_of_expert, disbprovider_accepts, proposals_rejected_by_provider, proposals_abandoned_by_provider
       FROM potential_disbursements 
       WHERE id = $1`,
      [id]
    );

    console.log("🔎 Existing Record:", existingRows);

    if (!existingRows.length) {
      throw new Error(`❌ Disbursement with ID ${id} not found in the database.`);
    }

    const { disbprovider_accepts, proposals_rejected_by_provider, proposals_abandoned_by_provider } = existingRows[0];

    // Ensure the provider has accepted the disbursement before abandoning it
    if (!disbprovider_accepts) {
      throw new Error("❌ Cannot abandon. Disbursement has NOT been accepted yet.");
    }

    // Ensure it has not been rejected already
    if (proposals_rejected_by_provider) {
      throw new Error("❌ Cannot abandon. The provider has already rejected this disbursement.");
    }

    // Ensure it's not already abandoned
    if (proposals_abandoned_by_provider === true) {
      throw new Error("❌ Cannot abandon. The provider has already abandoned this disbursement.");
    }

    console.log(`🔄 Updating proposals_abandoned_by_provider for ID "${id}"`);

    // Update disbursement status
    const { rows } = await client.query(
      `UPDATE potential_disbursements 
       SET proposals_abandoned_by_provider = TRUE 
       WHERE id = $1 
       RETURNING id, name_of_expert, 
                 proposals_abandoned_by_provider AS "proposalsAbandonedByProvider"`,
      [id]
    );

    console.log("🔄 Updated Row:", rows[0]); // Log update result

    if (!rows.length) {
      throw new Error("❌ Update failed. No records were modified.");
    }

    await client.query("COMMIT");

    return {
      id: rows[0].id,
      nameOfExpert: rows[0].name_of_expert,
      proposalsAbandonedByProvider: rows[0].proposalsAbandonedByProvider, // ✅ Guaranteed to be true after update
      providerAbandonsDisbursement: true // ✅ Explicitly returned to match GraphQL schema
    };

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Database Error:", error.message);
    throw new Error(`Database Error: ${error.message}`);
  } finally {
    client.release();
  }
},






}
