'use server';
import { supabase } from '@/lib/supabaseclient';

export const insertInvestorSignupData = async (data) => {
  const { error } = await supabase.from('investor_signup').insert([
    {
      profile_id: data.profile_id, // Add profile_id to the insert data
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      typeof: data.usertype,
      investment_thesis: data.investmentThesis,
      cheque_size: data.chequeSize,
      sectors: data.sectors,
      investment_stage: data.investmentStage.join(','),
    },
  ]);

  if (error) {
    console.error('Insert Error:', error);
    throw error;
  }
};
