import { supabase } from '@/lib/supabaseclient';

export const insertInvestorSignupData = async (data) => {
  const { error } = await supabase.from('investor_signup').insert([
    {
      profile_id: data.profile_id,
      company_name: data.companyname,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      typeof: data.usertype,
      investment_thesis: data.investmentThesis,
      cheque_size: data.chequeSize,
      sectors: data.sectors,
      investment_stage: data.investmentStage.join(','),
      profile_photo: data.profilePhoto,
    },
  ]);

  if (error) {
    console.error('Insert Error:', error);
    throw error;
  }
};

export const updateInvestorSignupData = async (profileId, data) => {
  // Prepare the data to be updated
  const fieldsToUpdate = {};

  if (data.name !== null && data.name !== undefined) {
    fieldsToUpdate.name = data.name;
  }
  if (data.companyname !== null && data.companyname !== undefined) {
    fieldsToUpdate.company_name = data.companyname;
  }
  if (data.email !== null && data.email !== undefined) {
    fieldsToUpdate.email = data.email;
  }
  if (data.mobile !== null && data.mobile !== undefined) {
    fieldsToUpdate.mobile = data.mobile;
  }
  if (data.usertype !== null && data.usertype !== undefined) {
    fieldsToUpdate.typeof = data.usertype;
  }
  if (data.investmentThesis !== null && data.investmentThesis !== undefined) {
    fieldsToUpdate.investment_thesis = data.investmentThesis;
  }
  if (data.chequeSize !== null && data.chequeSize !== undefined) {
    fieldsToUpdate.cheque_size = data.chequeSize;
  }
  if (data.sectors !== null && data.sectors !== undefined) {
    fieldsToUpdate.sectors = data.sectors;
  }
  if (data.investmentStage !== null && data.investmentStage !== undefined) {
    fieldsToUpdate.investment_stage = data.investmentStage.join(',');
  }
  if (data.profilePhoto !== null && data.profilePhoto !== undefined) {
    fieldsToUpdate.profile_photo = data.profilePhoto;
  }

  // Check if there are fields to update
  if (Object.keys(fieldsToUpdate).length === 0) {
    return { error: 'No fields to update' };
  }

  const { data: updatedData, error } = await supabase
    .from('investor_signup')
    .update(fieldsToUpdate)
    .eq('profile_id', profileId)
    .select(); // Retrieve the updated data

  if (error) {
    console.error('Update Error:', error);
    throw error;
  }

  return updatedData; // Return the updated data
};

export const handleFileUpload = async (file) => {
  if (!file) {
    console.log('Profile photo is not provided.');
    return null;
  }

  const filePath = `profile_photos/${Date.now()}-${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { publicUrl } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath).data;

    return publicUrl; // Return the public URL
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

export const handleSave = async (data, section) => {
  try {
    let profilePhotoUrl = null;
    if (data.profilePhoto && data.profilePhoto[0]) {
      profilePhotoUrl = await handleFileUpload(data.profilePhoto[0]);
    }

    const formData = {
      ...data,
      profilePhoto: profilePhotoUrl,
    };

    let result;
    switch (section) {
      case 'investor_details':
        result = investorSignup
          ? await updateInvestorSignupData(user?.id, formData)
          : await insertInvestorSignupData({
              ...formData,
              profile_id: user.id,
            });
        updateDetailsLocally(formData);
        break;
      default:
        console.error('Unknown section:', section);
        return;
    }

    reset();
    setEditingSection(null);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
};

export const insertInvestorDocuments = async (formData, profileId) => {
  try {
    const { data, error } = await supabase
      .from('document_management')
      .insert([
        {
          profile_id: profileId,
          company_name: formData.companyName || null,
          company_logo: formData.companyLogo || null,
          nda: formData.nda || null,
          termsheet: formData.termsheet || null,
          transaction_documents: formData.transactionDocuments || null,
          share_subscription_agreement:
            formData.shareSubscriptionAgreement || null,
          share_holder_agreement: formData.shareHolderAgreement || null,
          share_purchase_agreement: formData.sharePurchaseAgreement || null,
          conditions_precedent_documents:
            formData.conditionsPrecedentDocuments || null,
          closing_documents: formData.closingDocuments || null,
          cs_documents: formData.csDocuments || null,
          due_diligence_report: formData.dueDiligenceReport || null,
          mis_quarterly: formData.misQuarterly || null,
          mis_annually: formData.misAnnually || null,
          balance_sheet: formData.balanceSheet || null,
          pl_statement: formData.plStatement || null,
          cashflow_statement: formData.cashflowStatement || null,
          audited_financials: formData.auditedFinancials || null,
          valuation_report: formData.valuationReport || null,
          board_meetings: formData.boardMeetings || null,
          shareholders_meetings: formData.shareholdersMeetings || null,
          board_resolutions: formData.boardResolutions || null,
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

export const fetchInvestorDocuments = async (profileId) => {
  try {
    const { data, error } = await supabase
      .from('document_management')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error fetching investor documents:', error);
      return { error };
    }

    if (!data || data.length === 0) {
      console.error('No documents found for the given profile ID.');
      return { error: 'No documents found' };
    }

    console.log('Fetched investor documents:', data);
    return data; // Return the first item in the array
  } catch (error) {
    console.error('Error fetching investor documents:', error);
    return { error };
  }
};

export const handleInvestorFileUpload = async (
  file,
  companyName,
  folder,
  investorname
) => {
  if (!file) {
    console.log(`${folder} is not provided.`);
    return null;
  }

  const filePath = `${investorname}/${companyName}/${folder}/${Date.now()}-${
    file.name
  }`;

  try {
    const { data, error } = await supabase.storage
      .from('investorDocuments')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { publicUrl } = supabase.storage
      .from('investorDocuments')
      .getPublicUrl(filePath).data;

    console.log(`${folder} uploaded successfully:`, publicUrl);
    return publicUrl; // Return the public URL
  } catch (error) {
    console.error(`Error uploading ${folder}:`, error);
    throw error;
  }
};

const fieldToColumnMapping = {
  companyName: 'company_name',
  companyLogo: 'company_logo',
  nda: 'nda',
  termsheet: 'termsheet',
  transactionDocuments: 'transaction_documents',
  shareSubscriptionAgreement: 'share_subscription_agreement',
  shareHolderAgreement: 'share_holder_agreement',
  sharePurchaseAgreement: 'share_purchase_agreement',
  conditionsPrecedentDocuments: 'conditions_precedent_documents',
  closingDocuments: 'closing_documents',
  csDocuments: 'cs_documents',
  dueDiligenceReport: 'due_diligence_report',
  misQuarterly: 'mis_quarterly',
  misAnnually: 'mis_annually',
  balanceSheet: 'balance_sheet',
  plStatement: 'pl_statement',
  cashflowStatement: 'cashflow_statement',
  auditedFinancials: 'audited_financials',
  valuationReport: 'valuation_report',
  boardMeetings: 'board_meetings',
  shareholdersMeetings: 'shareholders_meetings',
  boardResolutions: 'board_resolutions',
  createdAt: 'created_at',
};

const transformFormData = (formData) => {
  const transformedData = {};
  for (const key in formData) {
    if (formData[key] && fieldToColumnMapping[key]) {
      transformedData[fieldToColumnMapping[key]] = formData[key];
    }
  }
  return transformedData;
};

export const updateInvestorDocuments = async (formData, userId, documentId) => {
  try {
    // Fetch current document data
    const { data: currentData, error: fetchError } = await supabase
      .from('document_management')
      .select('*')
      .eq('id', documentId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Transform formData using the mapping object
    const transformedFormData = transformFormData(formData);

    // Merge current data with the updated data
    const updatedData = {
      ...currentData,
      ...transformedFormData,
    };

    const { data, error } = await supabase
      .from('document_management') // Corrected the table name here
      .update(updatedData)
      .eq('id', documentId)
      .eq('profile_id', userId) // Ensure this column matches the correct user
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
