export default async function handler(req, res) {
  const { gstin } = req.query;

  if (!gstin) {
    return res.status(400).json({ error: 'GSTIN is required' });
  }

  try {
    const response = await fetch('https://api.invincibleocean.com/invincible/gstAdvanceSearchV2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'clientId': process.env.INVINCIBLE_OCEAN_CLIENT_ID,
        'secretKey': process.env.INVINCIBLE_OCEAN_SECRET_KEY,
      },
      body: JSON.stringify({ gstin }),
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Error: ${response.status} ${response.statusText}` 
      });
    }

    const data = await response.json();

    // Extract the required fields
    const {
      aggregate_turn_over,
      authorized_signatory,
      business_constitution,
      business_details,
      central_jurisdiction,
      compliance_rating,
      current_registration_status,
      filing_status,
      gstin,
      is_field_visit_conducted,
      legal_name,
      mandate_e_invoice,
      other_business_address,
      primary_business_address,
      register_cancellation_date,
      register_date,
      state_jurisdiction,
      tax_payer_type,
      trade_name,
      gross_total_income,
      gross_total_income_financial_year,
    } = data.result;

    // Store only the last three months of filing status
    const recent_filing_status = filing_status[0].slice(0, 3);

    // Insert the data into Supabase
    const { error } = await supabase.from('debt_gstin').insert({
      aggregate_turn_over,
      authorized_signatory,
      business_constitution,
      business_details,
      central_jurisdiction,
      compliance_rating,
      current_registration_status,
      filing_status: recent_filing_status,
      gstin,
      is_field_visit_conducted: is_field_visit_conducted === 'Yes',
      legal_name,
      mandate_e_invoice: mandate_e_invoice === 'Yes',
      other_business_address,
      primary_business_address,
      register_cancellation_date: register_cancellation_date ? new Date(register_cancellation_date) : null,
      register_date: new Date(register_date),
      state_jurisdiction,
      tax_payer_type,
      trade_name,
      gross_total_income,
      gross_total_income_financial_year,
    });

    if (error) {
      console.error('Error storing GSTIN data in Supabase:', error);
      throw new Error('Failed to store GSTIN data');
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching GSTIN data:', error.message);
    return res.status(500).json({ error: 'Failed to fetch GSTIN data' });
  }
}
