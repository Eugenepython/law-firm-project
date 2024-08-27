// verify.js
import express from 'express';
import pool from './db.js';

const router = express.Router();

router.get('/verify', async (req, res) => {
    console.log('Verification endpoint hit with token:', req.query.token);
  const { token } = req.query;

  if (!token) {
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
      res.send('Your account has been verified and accepted.');
    } else {
      res.status(400).send('Invalid or expired verification link');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).send('Internal server error');
  } finally {
    client.release();
  }
});

export default router; // Export the router
