'use server';
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
