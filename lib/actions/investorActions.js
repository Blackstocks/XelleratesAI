import { supabase } from '@/lib/supabaseclient';

export const insertInvestorSignupData = async (data) => {
  const { error } = await supabase.from('investor_signup').insert([
    {
      profile_id: data.profile_id,
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
  const { error } = await supabase
    .from('investor_signup')
    .update({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      typeof: data.usertype,
      investment_thesis: data.investmentThesis,
      cheque_size: data.chequeSize,
      sectors: data.sectors,
      investment_stage: data.investmentStage.join(','),
      profile_photo: data.profilePhoto,
    })
    .eq('profile_id', profileId);

  if (error) {
    console.error('Update Error:', error);
    throw error;
  }
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
