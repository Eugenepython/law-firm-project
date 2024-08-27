// server/resolvers/queries/Query.js
import pool from '../../db.js';

const Query = {
  hello: () => 'Hello world!',
  getUsers: async () => {
    const { rows } = await pool.query('SELECT * FROM law_firm_users');
    return rows;
  },
  getProviders: async () => {
    const { rows } = await pool.query('SELECT * FROM disb_provider_users');
    return rows;
  },
  lawFirmDetails: async (_, __, { userId }) => {
    console.log('userId in lawFirmDetails resolver:', userId);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const { rows } = await pool.query('SELECT * FROM law_firm_users WHERE id = $1', [userId]);
    console.log('Query result:', rows);
    if (rows.length === 0) {
      throw new Error("User not found");
    }
    const user = {
      ...rows[0],
      lawFirm: rows[0].law_firm,
    };
    return user;
  },
  providerDetails: async (_, __, { userId }) => {
    console.log('userId in providerDetails resolver:', userId);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const { rows } = await pool.query('SELECT * FROM disb_provider_users WHERE id = $1', [userId]);
    console.log('Query result:', rows);
    if (rows.length === 0) {
      throw new Error("Provider not found");
    }
    const provider = {
      ...rows[0],
      disbFirm: rows[0].disb_firm,
    };
    return provider;
  },

  getCases: async (_, { lawFirmId }) => {
    try {
      const { rows } = await pool.query('SELECT * FROM law_cases WHERE law_firm_id = $1', [lawFirmId]);
      return rows.map((caseItem) => ({
        id: caseItem.id,
        clientName: caseItem.client_name,
        role: caseItem.role,
        retainerDate: caseItem.retainer_date,
        retainerDescription: caseItem.retainer_description,
        feeEarner: caseItem.fee_earner,
        incidentDate: caseItem.incident_date,
        courtReference: caseItem.court_reference,
        caseDescription: caseItem.case_description,
        opposingParties: caseItem.opposing_parties,
        caseType: caseItem.case_type,
        diseaseClaimType: caseItem.disease_claim_type,
        yourReference: caseItem.your_reference,
        lawFirmId: caseItem.law_firm_id, // Include the lawFirmId in the response
      }));
    } catch (error) {
      console.error('Error fetching cases:', error);
      throw new Error('Failed to fetch cases');
    }
  },

  getCase: async (_, { id }) => {
    try {
      const { rows } = await pool.query('SELECT * FROM law_cases WHERE id = $1', [id]);
      if (rows.length === 0) throw new Error("Case not found");

      const caseItem = rows[0];
      return {
        id: caseItem.id,
        clientName: caseItem.client_name,
        role: caseItem.role,
        retainerDate: caseItem.retainer_date,
        retainerDescription: caseItem.retainer_description,
        feeEarner: caseItem.fee_earner,
        incidentDate: caseItem.incident_date,
        courtReference: caseItem.court_reference,
        caseDescription: caseItem.case_description,
        opposingParties: caseItem.opposing_parties,
        caseType: caseItem.case_type,
        diseaseClaimType: caseItem.disease_claim_type,
        yourReference: caseItem.your_reference,
        lawFirmId: caseItem.law_firm_id, // Include the lawFirmId in the response
      };
    } catch (error) {
      console.error('Error fetching case:', error);
      throw new Error('Failed to fetch case');
    }
  },
  getDisbursementPaths: async (_, { lawFirmId }) => {
    try {
      const { rows } = await pool.query('SELECT * FROM law_firm_disbs_paths WHERE law_firm_id = $1', [lawFirmId]);
      return rows.map((path) => ({
        id: path.disbursement_path_id,
        caseId: path.case_id,
        lawFirmId: path.law_firm_id,
        providerName: path.provider_name,
        invoiceReferences: path.invoice_references,
        expertDiscipline: path.expert_discipline,
        createdAt: path.created_at.toISOString(),
        updatedAt: path.updated_at.toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching disbursement paths:', error);
      throw new Error('Failed to fetch disbursement paths');
    }
  },
};

export default Query;
