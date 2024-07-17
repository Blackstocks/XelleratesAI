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
    return publicUrl; // Return the public URL
  } catch (error) {
    console.error(`Error uploading ${folder}:`, error);
    throw error;
  }
};

export const insertCompanyProfile = async (formData, uploadedFiles) => {
  const { data: companyProfileData, error: companyProfileError } =
    await supabase
      .from('company_profile')
      .insert([
        {
          profile_id: formData.profile_id, // Ensure the profile_id is included here
          company_name: formData.company_name || null,
          short_description: formData.short_description || null,
          incorporation_date: formData.incorporation_date || null,
          country: formData.country || null,
          state_city: formData.state_city || null,
          office_address: formData.office_address || null,
          pin_code: formData.pin_code || null,
          company_website: formData.company_website || null,
          linkedin_profile: formData.linkedin_profile || null,
          company_logo: uploadedFiles.company_logo || null,
          current_stage: formData.current_stage || null,
          team_size: formData.team_size || null,
          target_audience: formData.target_audience || null,
          usp_moat: formData.usp_moat || null,
          industry_sector: formData.industry_sector || null,
          media: formData.media || null,
        },
      ])
      .select();

  if (companyProfileError) {
    throw companyProfileError;
  }

  return companyProfileData[0];
};

export const insertFounderInformation = async (
  companyId,
  formData,
  uploadedFiles
) => {
  const { data, error: founderInformationError } = await supabase
    .from('founder_information')
    .insert([
      {
        company_id: companyId,
        founder_name: formData.founder_name || null,
        founder_email: formData.founder_email || null,
        founder_mobile: formData.founder_mobile || null,
        founder_linkedin: formData.founder_linkedin || null,
        degree_name: formData.degree_name || null,
        college_name: formData.college_name || null,
        graduation_year: formData.graduation_year || null,
        list_of_advisers: uploadedFiles.list_of_advisers || null,
      },
    ])
    .select();

  if (founderInformationError) {
    throw founderInformationError;
  }

  return data;
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
          cto_name: formData.cto_name || null,
          cto_email: formData.cto_email || null,
          cto_mobile: formData.cto_mobile || null,
          cto_linkedin: formData.cto_linkedin || null,
          tech_team_size: formData.tech_team_size || null,
          mobile_app_link: formData.mobile_app_link || null,
          technology_roadmap: uploadedFiles.technology_roadmap || null,
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
    const { data, error: fundingInformationError } = await supabase
      .from('funding_information')
      .insert([
        {
          company_id: companyId,
          total_funding_ask: formData.total_funding_ask || null,
          amount_committed: formData.amount_committed || null,
          current_cap_table: uploadedFiles.current_cap_table || null,
          government_grants: formData.government_grants || null,
          equity_split: formData.equity_split || null,
          fund_utilization: formData.fund_utilization || null,
          arr: formData.arr || null,
          mrr: formData.mrr || null,
        },
      ])
      .select();

    if (fundingInformationError) {
      console.error('Supabase insert error:', fundingInformationError);
      throw fundingInformationError;
    }

    console.log('Insert successful, data:', data);
    return { data: data[0] };
  } catch (error) {
    console.error('Error in insertFundingInformation:', error);
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

  return { data: data[0] };
};

export const updateStartupDetails = async (profileId, formData) => {
  try {
    const { data, error } = await supabase
      .from('company_profile')
      .update(formData)
      .eq('id', profileId)
      .select('*');

    if (error) {
      console.error('Supabase update error:', error);
      return { error };
    }

    return { data: data[0] };
  } catch (error) {
    console.error('Error in updateStartupInfo:', error);
    return { error };
  }
};

export const updateFounderInfo = async (companyId, formData) => {
  try {
    const { data, error } = await supabase
      .from('founder_information')
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
    console.error('Error in updateFounderInfo:', error);
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
export const updateCtoInfo = async (companyId, formData) => {
  const { data, error } = await supabase
    .from('CTO_info')
    .update(formData)
    .eq('company_id', companyId)
    .select('*');

  if (error) {
    console.error('Supabase update error:', error);
    return { error };
  }

  return { data: data[0] };
};

export const updateFundingInfo = async (companyId, formData) => {
  const { data, error } = await supabase
    .from('funding_information')
    .update(formData)
    .eq('company_id', companyId)
    .select('*'); // Ensure all fields are returned

  if (error) {
    console.error('Supabase update error:', error);
    return { error };
  }

  return { data: data[0] };
};

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

export const updateCompanyDocuments = async (companyId, formData) => {
  try {
    const { data, error } = await supabase
      .from('company_documents')
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
    console.error('Error in updateCompanyDocuments:', error);
    return { error };
  }
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
