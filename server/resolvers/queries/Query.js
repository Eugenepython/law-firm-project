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


  getDisbursementPaths: async (_, { lawFirmId, caseId }) => {
    console.log(`🔍 Fetching disbursement paths for lawFirmId: ${lawFirmId}, caseId: ${caseId}`);
    try {
      if (!lawFirmId || !caseId) {
        console.warn("🛑 Missing lawFirmId or caseId! Returning empty array.");
        return [];
      }
      const { rows } = await pool.query(
        `SELECT disbursement_path_id, case_id, law_firm_id, provider_name, invoice_references, 
                expert_discipline, name_of_expert, created_at, updated_at, disb_provider_id
         FROM law_firm_disbs_paths
         WHERE law_firm_id = $1 AND case_id = $2`,  // ✅ Ensuring case_id matches
        [lawFirmId, caseId]
      );
      console.log('✅ Query Result:', JSON.stringify(rows, null, 2));
      if (!rows || rows.length === 0) {
        console.warn("⚠️ No disbursement paths found for this caseId:", caseId);
        return [];
      }
      return rows.map((path) => ({
        id: path.disbursement_path_id,
        caseId: path.case_id,
        lawFirmId: path.law_firm_id,
        providerName: path.provider_name,
        invoiceReferences: path.invoice_references,
        expertDiscipline: path.expert_discipline,
        nameOfExpert: path.name_of_expert || 'N/A',
        createdAt: path.created_at ? path.created_at.toISOString() : null,
        updatedAt: path.updated_at ? path.updated_at.toISOString() : null,
        disbProviderId: path.disb_provider_id,
      }));
    } catch (error) {
      console.error('🚨 Error fetching disbursement paths:', error.message);
      throw new Error(`Failed to fetch disbursement paths: ${error.message}`);
    }
  }, 
  



  getDisbProviderUsers: async () => {
    try {
      const { rows } = await pool.query('SELECT * FROM disb_provider_users');

      // Map the database fields to match the GraphQL schema
      return rows.map(user => ({
        id: user.id,
        username: user.username,
        disbFirm: user.disb_firm,      // Map disb_firm to disbFirm
        email: user.email,
        createdAt: user.created_at,    // If your GraphQL schema expects createdAt
        status: user.status,
        verificationToken: user.verification_token, // Map if needed
        // Include any other fields as necessary
      }));
    } catch (err) {
      console.error('Error fetching provider users:', err);
      throw new Error('Error fetching provider users');
    }
  },

  previousDisbursements: async (_, { disbursementId }) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM potential_disbursements WHERE disbursement_id = $1",
        [disbursementId]
      );
      console.log("Raw database response:", rows);

      const mappedRows = rows.map((row) => ({
        id: row.id,
        disbursementId: row.disbursement_id,
        caseId: row.case_id,
        lawFirmId: row.law_firm_id,
        report: row.report,
        lawFirmAgreesToPay: row.law_firm_agrees_to_pay, // Convert 't' to true
        priceType: row.price_type,
        priceValue: row.price_value,
        priceMin: row.price_min,
        priceMax: row.price_max,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : null, // Convert to ISO format
      }));
      console.log("Mapped previous disbursements:", mappedRows);
      return mappedRows;
    } catch (error) {
      console.error("Error fetching previous disbursements:", error);
      throw new Error("Could not fetch previous disbursements.");
    }
  },



  getDisbursementsByProviderIdAndCaseId: async (_, { disbProviderId, caseId }) => {
    console.log('Starting disbursement fetch for provider ID:', disbProviderId, 'and case ID:', caseId);
    if (!disbProviderId) {
        console.error('Error: disbProviderId is required but was not provided.');
        throw new Error('Invalid disbProviderId: A valid provider ID must be provided.');
    }
    try {
        console.log('Received disbProviderId:', disbProviderId, 'of type:', typeof disbProviderId);
        console.log('Received caseId:', caseId, 'of type:', typeof caseId);
        let query = `
            SELECT pd.*, 
                   lfu.law_firm AS law_firm_name, 
                   pd.provider_name,  
                   pd.disbprovider_accepts,
                   pd.client_name,
                   pd.proposals_rejected_by_provider,
                   pd.proposals_abandoned_by_provider
            FROM potential_disbursements pd
            JOIN law_firm_users lfu ON pd.law_firm_id = lfu.id
            WHERE pd.disb_provider_id = $1
        `;
        let queryParams = [disbProviderId];
        if (caseId) {
            query += ` AND pd.case_id = $2`;
            queryParams.push(caseId);
        }
        console.log("Executing SQL Query:", query);
        console.log("With parameters:", queryParams);
        const { rows } = await pool.query(query, queryParams);
        console.log('Query returned', rows.length, 'rows');
        if (!rows.length) {
            console.log(`No disbursements found for provider ID: ${disbProviderId} and case ID: ${caseId || 'N/A'}`);
            return [];
        }
        const disbursements = rows.map(row => ({
            id: row.id,
            disbursementId: row.disbursement_id,
            caseId: row.case_id,
            lawFirmId: row.law_firm_id,
            lawFirmName: row.law_firm_name,
            report: row.report,
            lawFirmAgreesToPay: row.law_firm_agrees_to_pay,
            priceType: row.price_type,
            priceValue: row.price_value || null,
            priceMin: row.price_min || null,
            priceMax: row.price_max || null,
            createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
            disbProviderId: row.disb_provider_id,
            expertDiscipline: row.expert_discipline,
            providerName: row.provider_name,
            nameOfExpert: row.name_of_expert,
            lawFirmRetractsBeforeDisbProviderAccepts: row.law_firm_retracts_before_disbprovider_accepts,
            disbProviderAccepts: row.disbprovider_accepts,
            clientName: row.client_name,
            proposalsRejectedByProvider: row.proposals_rejected_by_provider,  // New field
            providerAbandonsDisbursement: row.proposals_abandoned_by_provider // New field
        }));
        console.log('Mapped disbursements:', disbursements.length, 'items');
        return disbursements;
    } catch (error) {
        console.error(`Error fetching disbursements: ${error.message}`, error);
        throw new Error(`Failed to fetch disbursements: ${error.message}`);
    }
},




  
  getLawCasesWithClientInfo: async () => {
    try {
      const { rows } = await pool.query(
        `SELECT 
           lfu.username AS client_name, 
           lc.opposing_parties, 
           lc.case_description, 
           lc.fee_earner, 
           lc.incident_date, 
           lc.client_name AS original_client_name
         FROM 
           law_cases lc
         JOIN 
           law_firm_users lfu 
         ON 
           lc.law_firm_id = lfu.id`
      );
  
      return rows.map((row) => ({
        clientName: row.client_name,
        opposingParties: row.opposing_parties,
        caseDescription: row.case_description,
        feeEarner: row.fee_earner,
        incidentDate: row.incident_date,
        originalClientName: row.original_client_name,
      }));
    } catch (error) {
      console.error('Error fetching law cases with client info:', error);
      throw new Error('Failed to fetch law cases with client information');
    }
  },
  

  disbProviderGetsPotentialDisbursements: async (_, { disbProviderId, clientName, nameOfExpert }) => {
    try {
        console.log(`Fetching disbursements for Provider ID: ${disbProviderId}`);
        let query = `
            SELECT pd.*,
                   COALESCE(lfu.law_firm, 'Unknown Law Firm') AS law_firm_name
            FROM potential_disbursements pd
            LEFT JOIN law_firm_users lfu ON pd.law_firm_id = lfu.id
            WHERE pd.disb_provider_id = $1
        `;
        let values = [disbProviderId];
        if (clientName) {
            query += ` AND pd.client_name ILIKE $${values.length + 1}`;
            values.push(`%${clientName}%`);
        }
        if (nameOfExpert) {
            query += ` AND pd.name_of_expert ILIKE $${values.length + 1}`;
            values.push(`%${nameOfExpert}%`);
        }
        console.log("Executing SQL Query:", query);
        console.log("Query Parameters:", values);
        const { rows } = await pool.query(query, values);
        console.log('Query returned', rows.length, 'rows');
        if (!rows.length) {
            console.log(`No disbursements found for provider ID: ${disbProviderId}`);
            return [];
        }
        return rows.map(row => {
          console.log("Raw DB Value for lawFirmRetractsBeforeDisbproviderAccepts:", row.law_firm_retracts_before_disbprovider_accepts);
          return {
              id: row.id,
              disbursementId: row.disbursement_id,
              caseId: row.case_id,
              lawFirmId: row.law_firm_id,
              lawFirmName: row.law_firm_name || 'Unknown Law Firm',
              report: row.report,
              lawFirmAgreesToPay: row.law_firm_agrees_to_pay,
              priceType: row.price_type,
              priceValue: row.price_value || null,
              priceMin: row.price_min || null,
              priceMax: row.price_max || null,
              createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
              disbProviderId: row.disb_provider_id,
              expertDiscipline: row.expert_discipline,
              providerName: row.provider_name,
              disbProviderAccepts: row.disbprovider_accepts,
              lawFirmRetractsBeforeDisbProviderAccepts: row.law_firm_retracts_before_disbprovider_accepts,
              clientName: row.client_name,
              nameOfExpert: row.name_of_expert,
              proposalsRejectedByProvider: row.proposals_rejected_by_provider,
              providerAbandonsDisbursement: row.proposals_abandoned_by_provider
          };
      });
      
    } catch (error) {
        console.error("Error fetching disbursements:", error);
        throw new Error("Failed to fetch disbursements");
    }
},


  



  };
  

export default Query;
