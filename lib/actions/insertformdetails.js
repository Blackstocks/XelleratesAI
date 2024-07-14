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
          company_name: formData.companyName,
          short_description: formData.shortDescription,
          incorporation_date: formData.incorporationDate,
          country: formData.country,
          state_city: formData.stateCity,
          office_address: formData.officeAddress,
          pin_code: formData.pinCode,
          company_website: formData.companyWebsite,
          linkedin_profile: formData.linkedinProfile,
          company_logo: uploadedFiles.companyLogo || '',
          current_stage: formData.currentStage,
          team_size: formData.teamSize,
          target_audience: formData.targetAudience,
          usp_moat: formData.uspMoat,
          industry_sector: formData.industrySector,
          media: formData.media,
        },
      ])
      .select();

  if (companyProfileError) {
    throw companyProfileError;
  }

  return companyProfileData[0].id;
};

export const insertCompanyDocuments = async (
  companyId,
  formData,
  uploadedFiles
) => {
  const { data, error } = await supabase.from('company_documents').insert([
    {
      company_id: companyId,
      certificate_of_incorporation:
        uploadedFiles.certificateOfIncorporation || '',
      gst_certificate: uploadedFiles.gstCertificate || '',
      trademark: uploadedFiles.trademark || '',
      copyright: uploadedFiles.copyright || '',
      patent: uploadedFiles.patent || '',
      startup_india_certificate: uploadedFiles.startupIndiaCertificate || '',
      due_diligence_report: uploadedFiles.dueDiligenceReport || '',
      business_valuation_report: uploadedFiles.businessValuationReport || '',
      mis: uploadedFiles.mis || '',
      financial_projections: uploadedFiles.financialProjections || '',
      balance_sheet: uploadedFiles.balanceSheet || '',
      pl_statement: uploadedFiles.plStatement || '',
      cashflow_statement: uploadedFiles.cashflowStatement || '',
      pitch_deck: uploadedFiles.pitchDeck || '',
      video_pitch: uploadedFiles.videoPitch || '',
      sha: uploadedFiles.sha || '',
      termsheet: uploadedFiles.termsheet || '',
      employment_agreement: uploadedFiles.employmentAgreement || '',
      mou: uploadedFiles.mou || '',
      nda: uploadedFiles.nda || '',
    },
  ]);

  if (error) {
    throw error;
  }

  return data;
};

export const insertCTODetails = async (companyId, formData, uploadedFiles) => {
  try {
    // Insert CTO details into the 'cto_information' table
    const { error: ctoDetailsError } = await supabase.from('CTO_info').insert([
      {
        company_id: companyId,
        cto_name: formData.ctoName,
        cto_email: formData.ctoEmail,
        cto_mobile: formData.ctoMobile,
        cto_linkedin: formData.ctoLinkedin,
        tech_team_size: formData.techTeamSize,
        mobile_app_link: formData.mobileAppLink,
        technology_roadmap: uploadedFiles.technologyRoadmap || '',
      },
    ]);

    if (ctoDetailsError) {
      throw ctoDetailsError;
    }

    console.log('CTO details inserted successfully');
  } catch (error) {
    console.error('Error inserting CTO details:', error);
    throw error;
  }
};
export const insertBusinessDetails = async (
  companyId,
  formData,
  uploadedFiles
) => {
  const { error: businessDetailsError } = await supabase
    .from('business_details')
    .insert([
      {
        company_id: companyId,
        current_traction: formData.currentTraction,
        new_Customers: formData.newCustomers,
        customer_AcquisitionCost: formData.customerAcquisitionCost,
        customer_Lifetime_Value: formData.customerLifetimeValue,
        // certificate_of_incorporation:
        //   uploadedFiles.certificateOfIncorporation || '',
        // gst_certificate: uploadedFiles.gstCertificate || '',
        // startup_india_certificate: uploadedFiles.startupIndiaCertificate || '',
        // due_diligence_report: uploadedFiles.dueDiligenceReport || '',
        // business_valuation_report: uploadedFiles.businessValuationReport || '',
        // mis: uploadedFiles.mis || '',
        // pitch_deck: uploadedFiles.pitchDeck || '',
        // video_pitch: uploadedFiles.videoPitch || '',
      },
    ]);

  if (businessDetailsError) {
    throw businessDetailsError;
  }
};

export const insertFundingInformation = async (
  companyId,
  formData,
  uploadedFiles
) => {
  const { error: fundingInformationError } = await supabase
    .from('funding_information')
    .insert([
      {
        company_id: companyId,
        total_funding_ask: formData.totalFundingAsk,
        amount_committed: formData.amountCommitted,
        current_cap_table: uploadedFiles.currentCapTable || '',
        government_grants: formData.governmentGrants,
        equity_split: formData.equitySplit,
        fund_utilization: formData.fundUtilization,
        arr: formData.arr,
        mrr: formData.mrr,
      },
    ]);

  if (fundingInformationError) {
    throw fundingInformationError;
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

export const insertFounderInformation = async (
  companyId,
  formData,
  uploadedFiles
) => {
  const { error: founderInformationError } = await supabase
    .from('founder_information')
    .insert([
      {
        company_id: companyId,
        founder_name: formData.founderName,
        founder_email: formData.founderEmail,
        founder_mobile: formData.founderMobile,
        founder_linkedin: formData.founderLinkedin,
        degree_name: formData.degreeName,
        college_name: formData.collegeName,
        graduation_year: formData.graduationYear,
        list_of_advisers: uploadedFiles.listofAdvisers,
      },
    ]);

  if (founderInformationError) {
    throw founderInformationError;
  }
};

export const insertCofounderInformation = async (companyId, formData) => {
  const { error: cofounderInformationError } = await supabase
    .from('cofounder_information')
    .insert([
      {
        company_id: companyId,
        cofounder_name: formData.cofounderName,
        cofounder_email: formData.cofounderEmail,
        cofounder_mobile: formData.cofounderMobile,
        cofounder_linkedin: formData.cofounderLinkedin,
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
  const { data, error } = await supabase
    .from('company_profile')
    .update(formData)
    .eq('profile_id', profileId)
    .select('*');

  if (error) {
    console.error('Supabase update error:', error);
    return { error };
  }

  return { data: data[0] };
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
