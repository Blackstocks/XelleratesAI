import { supabase } from '@/lib/supabaseclient';

export const updateFile = async (file, bucket, companyName, folder) => {
  if (!file) {
    console.log(`${folder} is not provided.`);
    return null;
  }

  console.log(`Updating ${folder}:`, file);

  const filePath = `${companyName}/${folder}/${Date.now()}-${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .update(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath).data;

    console.log(`${folder} updated successfully:`, publicUrl);
    return publicUrl; // Return the public URL
  } catch (error) {
    console.error(`Error updating ${folder}:`, error);
    throw error;
  }
};

export const handleFileUpload = async (file, bucket, companyName, folder) => {
  if (!file) {
    console.log(`${folder} is not provided.`);
    return null;
  }

  console.log(`Uploading ${folder}:`, file);

  const filePath = `${companyName}/${folder}/${Date.now()}-${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath).data;
    console.log(`${folder} uploaded successfully:`, publicUrl);
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${folder}:`, error);
    throw error;
  }
};

export const insertStartupDetails = async (formData, profileId) => {
  try {
    const { data, error } = await supabase
      .from('company_profile')
      .insert([
        {
          profile_id: profileId,
          company_name: formData.company_name || null,
          incorporation_date: formData.incorporation_date || null,
          country: formData.country || null,
          state_city: formData.state_city || null,
          office_address: formData.office_address || null,
          company_website: formData.company_website || null,
          linkedin_profile: formData.linkedin_profile || null,
          short_description: formData.short_description || null,
          target_audience: formData.target_audience || null,
          industry_sector: formData.industry_sector || null,
          team_size: formData.team_size || null,
          current_stage: formData.current_stage || null,
          usp_moat: formData.usp_moat || null,
          media: formData.media || null,
          company_logo: formData.company_logo || null,
          social_media_handles: formData.socialMedia || [],
          media_presence: formData.socialMediaPresence || [], // Ensure this is handled correctly as JSONB
        },
      ])
      .select('*'); // Ensure all fields are returned

    if (error) {
      console.error('Error inserting startup details:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      console.error('No data returned after inserting startup details.');
      return { error: 'No data returned' };
    }

    console.log('Inserted startup details:', data);
    return data[0]; // Return the first item in the array
  } catch (error) {
    console.error('Error inserting startup details:', error);
    return { error };
  }
};

export const insertFounderInformation = async (
  companyId,
  formData,
  uploadedFiles
) => {
  try {
    const { data, error } = await supabase
      .from('founder_information')
      .insert([
        {
          company_id: companyId,
          founder_name: formData.founder_name,
          founder_email: formData.founder_email,
          founder_mobile: formData.founder_mobile,
          founder_linkedin: formData.founder_linkedin,
          degree_name: formData.degree_name,
          college_name: formData.college_name,
          graduation_year: formData.graduation_year,
          advisors: formData.advisors || [], // Ensure this is handled correctly as JSONB
          co_founders: formData.co_founders || [], // Ensure this is handled correctly as JSONB
          co_founder_agreement: uploadedFiles.co_founder_agreement || '',
        },
      ])
      .select('*'); // Ensure all fields are returned

    if (error) {
      console.error('Error inserting founder information:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      console.error('No data returned after inserting founder information.');
      return { error: 'No data returned' };
    }

    console.log('Inserted founder information:', data);
    return data[0]; // Return the first item in the array
  } catch (error) {
    console.error('Error inserting founder information:', error);
    return { error };
  }
};

export const insertCompanyDocuments = async (companyId, uploadedFiles) => {
  const { data, error } = await supabase
    .from('company_documents')
    .insert([
      {
        company_id: companyId,
        certificate_of_incorporation:
          uploadedFiles.certificateOfIncorporation || null,
        gst_certificate: uploadedFiles.gstCertificate || null,
        trademark: uploadedFiles.trademark || null,
        copyright: uploadedFiles.copyright || null,
        patent: uploadedFiles.patent || null,
        startup_india_certificate:
          uploadedFiles.startupIndiaCertificate || null,
        due_diligence_report: uploadedFiles.dueDiligenceReport || null,
        business_valuation_report:
          uploadedFiles.businessValuationReport || null,
        mis: uploadedFiles.mis || null,
        financial_projections: uploadedFiles.financialProjections || null,
        balance_sheet: uploadedFiles.balanceSheet || null,
        pl_statement: uploadedFiles.plStatement || null,
        cashflow_statement: uploadedFiles.cashflowStatement || null,
        pitch_deck: uploadedFiles.pitchDeck || null,
        video_pitch: uploadedFiles.videoPitch || null,
        sha: uploadedFiles.sha || null,
        termsheet: uploadedFiles.termsheet || null,
        employment_agreement: uploadedFiles.employmentAgreement || null,
        mou: uploadedFiles.mou || null,
        nda: uploadedFiles.nda || null,
      },
    ])
    .select();

  if (error) {
    throw error;
  }
  console.log('Company documents inserted successfully:', data);

  return data[0];
};

export const insertCTODetails = async (companyId, formData, uploadedFiles) => {
  try {
    // Insert CTO details into the 'CTO_info' table
    const { data, error: ctoDetailsError } = await supabase
      .from('CTO_info')
      .insert([
        {
          company_id: companyId,
          cto_name: formData.cto_name,
          cto_email: formData.cto_email,
          cto_mobile: formData.cto_mobile,
          cto_linkedin: formData.cto_linkedin,
          tech_team_size: formData.tech_team_size,
          mobile_app_link_ios: formData.mobile_app_link_ios,
          mobile_app_link_android: formData.mobile_app_link_android,
          technology_roadmap: uploadedFiles.technology_roadmap,
        },
      ])
      .select();

    if (ctoDetailsError) {
      throw ctoDetailsError;
    }

    console.log('CTO details inserted successfully');
    return data[0];
  } catch (error) {
    console.error('Error inserting CTO details:', error);
    throw error;
  }
};

export const insertBusinessDetails = async (companyId, formData) => {
  try {
    console.log('Inserting business details with companyId:', companyId);
    console.log('Form Data:', formData);

    const { data, error: businessDetailsError } = await supabase
      .from('business_details')
      .insert([
        {
          company_id: companyId || null,
          current_traction: formData.current_traction || null,
          new_Customers: formData.new_Customers || null,
          customer_AcquisitionCost: formData.customer_AcquisitionCost || null,
          customer_Lifetime_Value: formData.customer_Lifetime_Value || null,
        },
      ])
      .select();

    if (businessDetailsError) {
      console.error('Supabase insert error:', businessDetailsError);
      throw businessDetailsError;
    }

    console.log('Insert successful, data:', data);
    return { data: data[0] };
  } catch (error) {
    console.error('Error in insertBusinessDetails:', error);
    return { error };
  }
};

export const insertFundingInformation = async (
  companyId,
  formData,
  uploadedFiles
) => {
  try {
    const { data, error } = await supabase
      .from('funding_information')
      .insert([
        {
          company_id: companyId,
          total_funding_ask: formData.total_funding_ask,
          amount_committed: formData.amount_committed,
          // current_cap_table: uploadedFiles.current_cap_table || '',
          government_grants: formData.government_grants,
          equity_split: formData.equity_split,
          fund_utilization: formData.fund_utilization,
          arr: formData.arr,
          mrr: formData.mrr,
          previous_funding: formData.previous_funding || [], // Ensure this is handled correctly as JSONB
          cap_table: formData.capTable || [], // Ensure this is handled correctly as JSONB
        },
      ])
      .select('*'); // Ensure all fields are returned

    if (error) {
      console.error('Error inserting funding information:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      console.error('No data returned after inserting funding information.');
      return { error: 'No data returned' };
    }

    console.log('Inserted funding information:', data);
    return data[0]; // Return the first item in the array
  } catch (error) {
    console.error('Error inserting funding information:', error);
    return { error };
  }
};

export const insertContactInformation = async (companyId, formData) => {
  const { error: contactInformationError } = await supabase
    .from('contact_information')
    .insert([
      {
        company_id: companyId,
        mobile: formData.mobile,
        business_description: formData.businessDescription,
      },
    ]);

  if (contactInformationError) {
    throw contactInformationError;
  }
};

export const insertCofounderInformation = async (companyId, formData) => {
  const { error: cofounderInformationError } = await supabase
    .from('cofounder_information')
    .insert([
      {
        company_id: companyId,
        cofounder_name: formData.cofounderName || null,
        cofounder_email: formData.cofounderEmail || null,
        cofounder_mobile: formData.cofounderMobile || null,
        cofounder_linkedin: formData.cofounderLinkedin || null,
      },
    ]);

  if (cofounderInformationError) {
    throw cofounderInformationError;
  }
};
export const updateGeneralInfo = async (userId, formData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(formData)
    .eq('id', userId)
    .select('*'); // Ensure all fields are returned
  if (error) {
    console.error('Supabase update error:', error);
    return { error };
  }
  console.log('Update successful, data:', data);

  return { data: data[0] };
};

export const updateStartupDetails = async (formData, userId) => {
  try {
    const { data, error } = await supabase
      .from('company_profile')
      .update({
        company_name: formData.company_name || null,
        incorporation_date: formData.incorporation_date || null,
        country: formData.country || null,
        state_city: formData.state_city || null,
        office_address: formData.office_address || null,
        company_website: formData.company_website || null,
        linkedin_profile: formData.linkedin_profile || null,
        short_description: formData.short_description || null,
        target_audience: formData.target_audience || null,
        industry_sector: formData.industry_sector || null,
        team_size: formData.team_size || null,
        current_stage: formData.current_stage || null,
        usp_moat: formData.usp_moat || null,
        media: formData.media || null,
        company_logo: formData.company_logo || null,
        social_media_handles: formData.socialMedia || [],
        media_presence: formData.socialMediaPresence || [], // Ensure this is handled correctly as JSONB
      })
      .eq('profile_id', userId)
      .select('*'); // Ensure all fields are returned

    if (error) {
      console.error('Error updating startup details:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      console.error('No data returned after updating startup details.');
      return { error: 'No data returned' };
    }

    console.log('Updated startup details:', data);
    return data[0]; // Return the first item in the array
  } catch (error) {
    console.error('Error updating startup details:', error);
    return { error };
  }
};

export const updateFundingInfo = async (companyId, formData) => {
  try {
    const { data, error } = await supabase
      .from('funding_information')
      .update({
        total_funding_ask: formData.total_funding_ask,
        amount_committed: formData.amount_committed,
        // current_cap_table: formData.current_cap_table || '',
        government_grants: formData.government_grants,
        equity_split: formData.equity_split,
        fund_utilization: formData.fund_utilization,
        arr: formData.arr,
        mrr: formData.mrr,
        previous_funding: formData.previous_funding || [], // Ensure this is handled correctly as JSONB
        cap_table: formData.capTable || [], // Ensure this is handled correctly as JSONB
      })
      .eq('company_id', companyId)
      .select('*'); // Ensure all fields are returned

    if (error) {
      console.error('Error updating funding information:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      console.error('No data returned after updating funding information.');
      return { error: 'No data returned' };
    }

    console.log('Updated funding information:', data);
    return data[0]; // Return the first item in the array
  } catch (error) {
    console.error('Error updating funding information:', error);
    return { error };
  }
};

export const updateCTODetails = async (companyId, formData) => {
  try {
    const { data, error } = await supabase
      .from('CTO_info')
      .update(formData)
      .eq('company_id', companyId)
      .select('*'); // Ensure all fields are returned

    if (error) {
      console.error('Supabase update error:', error);
      return { error };
    }

    console.log('Update successful, data:', data);
    return { data: data[0] };
  } catch (error) {
    console.error('Error in updateCTODetails:', error);
    return { error };
  }
};

export const updateBusinessDetails = async (companyId, formData) => {
  const { data, error } = await supabase
    .from('business_details')
    .update(formData)
    .eq('company_id', companyId)
    .select('*');

  if (error) {
    console.error('Supabase update error:', error);
    return { error };
  }

  return { data: data[0] };
};
// export const updateCtoInfo = async (companyId, formData) => {
//   const { data, error } = await supabase
//     .from('CTO_info')
//     .update(formData)
//     .eq('company_id', companyId)
//     .select('*');

//   if (error) {
//     console.error('Supabase update error:', error);
//     return { error };
//   }

//   return { data: data[0] };
// };

export const updateProfile = async (id, data) => {
  try {
    const { data: updatedData, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return updatedData;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const updateInvestorDetails = async (id, data) => {
  try {
    const { data: updatedData, error } = await supabase
      .from('investor_signup')
      .update(data)
      .eq('profile_id', id)
      .select('*');

    if (error) {
      throw new Error(error.message);
    }

    return updatedData;
  } catch (error) {
    console.error('Error updating investor details:', error);
    throw error;
  }
};

export const updateCompanyDocuments = async (companyId, uploadedFiles) => {
  // Create an object to hold the fields to be updated
  const fieldsToUpdate = {};

  if (uploadedFiles.certificateOfIncorporation) {
    fieldsToUpdate.certificate_of_incorporation =
      uploadedFiles.certificateOfIncorporation;
  }
  if (uploadedFiles.gstCertificate) {
    fieldsToUpdate.gst_certificate = uploadedFiles.gstCertificate;
  }
  if (uploadedFiles.trademark) {
    fieldsToUpdate.trademark = uploadedFiles.trademark;
  }
  if (uploadedFiles.copyright) {
    fieldsToUpdate.copyright = uploadedFiles.copyright;
  }
  if (uploadedFiles.patent) {
    fieldsToUpdate.patent = uploadedFiles.patent;
  }
  if (uploadedFiles.startupIndiaCertificate) {
    fieldsToUpdate.startup_india_certificate =
      uploadedFiles.startupIndiaCertificate;
  }
  if (uploadedFiles.dueDiligenceReport) {
    fieldsToUpdate.due_diligence_report = uploadedFiles.dueDiligenceReport;
  }
  if (uploadedFiles.businessValuationReport) {
    fieldsToUpdate.business_valuation_report =
      uploadedFiles.businessValuationReport;
  }
  if (uploadedFiles.mis) {
    fieldsToUpdate.mis = uploadedFiles.mis;
  }
  if (uploadedFiles.financialProjections) {
    fieldsToUpdate.financial_projections = uploadedFiles.financialProjections;
  }
  if (uploadedFiles.balanceSheet) {
    fieldsToUpdate.balance_sheet = uploadedFiles.balanceSheet;
  }
  if (uploadedFiles.plStatement) {
    fieldsToUpdate.pl_statement = uploadedFiles.plStatement;
  }
  if (uploadedFiles.cashflowStatement) {
    fieldsToUpdate.cashflow_statement = uploadedFiles.cashflowStatement;
  }
  if (uploadedFiles.pitchDeck) {
    fieldsToUpdate.pitch_deck = uploadedFiles.pitchDeck;
  }
  if (uploadedFiles.videoPitch) {
    fieldsToUpdate.video_pitch = uploadedFiles.videoPitch;
  }
  if (uploadedFiles.sha) {
    fieldsToUpdate.sha = uploadedFiles.sha;
  }
  if (uploadedFiles.termsheet) {
    fieldsToUpdate.termsheet = uploadedFiles.termsheet;
  }
  if (uploadedFiles.employmentAgreement) {
    fieldsToUpdate.employment_agreement = uploadedFiles.employmentAgreement;
  }
  if (uploadedFiles.mou) {
    fieldsToUpdate.mou = uploadedFiles.mou;
  }
  if (uploadedFiles.nda) {
    fieldsToUpdate.nda = uploadedFiles.nda;
  }

  // Check if there are fields to update
  if (Object.keys(fieldsToUpdate).length === 0) {
    return { error: 'No fields to update' };
  }

  // Perform the update
  const { data, error } = await supabase
    .from('company_documents')
    .update(fieldsToUpdate)
    .eq('company_id', companyId)
    .select();

  if (error) {
    throw error;
  }
  console.log('Company documents updated successfully:', data);

  return data[0];
};

export const checkStartupDetailsExists = async (profileId) => {
  const { data, error } = await supabase
    .from('company_profile')
    .select('*')
    .eq('profile_id', profileId);

  if (error) {
    console.error('Supabase check error:', error);
    return false;
  }

  return data.length > 0;
};

export const checkFounderInfoExists = async (companyId) => {
  const { data, error } = await supabase
    .from('founder_information')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    console.error('Supabase check error:', error);
    return false;
  }

  return data.length > 0;
};

export const checkBusinessDetailsExists = async (companyId) => {
  const { data, error } = await supabase
    .from('business_details')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    console.error('Supabase check error:', error);
    return false;
  }

  return data.length > 0;
};

export const checkFundingInfoExists = async (companyId) => {
  const { data, error } = await supabase
    .from('funding_information')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    console.error('Supabase check error:', error);
    return false;
  }

  return data.length > 0;
};

export const checkCtoInfoExists = async (companyId) => {
  const { data, error } = await supabase
    .from('CTO_info')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    console.error('Supabase check error:', error);
    return false;
  }

  return data.length > 0;
};

export const checkCompanyDocumentsExists = async (companyId) => {
  const { data, error } = await supabase
    .from('company_documents')
    .select('*')
    .eq('company_id', companyId);

  if (error) {
    console.error('Supabase check error:', error);
    return false;
  }

  return data.length > 0;
};

export const updateFounderInformation = async (
  companyId,
  formData,
  uploadedFiles
) => {
  try {
    const { data, error } = await supabase
      .from('founder_information')
      .update({
        founder_name: formData.founder_name,
        founder_email: formData.founder_email,
        founder_mobile: formData.founder_mobile,
        founder_linkedin: formData.founder_linkedin,
        degree_name: formData.degree_name,
        college_name: formData.college_name,
        graduation_year: formData.graduation_year,
        advisors: formData.advisors || [], // Ensure this is handled correctly as JSONB
        co_founders: formData.co_founders || [], // Ensure this is handled correctly as JSONB
        co_founder_agreement: uploadedFiles.co_founder_agreement || '',
      })
      .eq('company_id', companyId)
      .select('*'); // Ensure all fields are returned

    if (error) {
      console.error('Error updating founder information:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      console.error('No data returned after updating founder information.');
      return { error: 'No data returned' };
    }

    console.log('Updated founder information:', data);
    return data[0]; // Return the first item in the array
  } catch (error) {
    console.error('Error updating founder information:', error);
    return { error };
  }
};
