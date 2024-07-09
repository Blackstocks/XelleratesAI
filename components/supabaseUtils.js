// utils/supabaseUtils.js

import { supabase } from '@/lib/supabaseclient';

export const updateInterestStatus = async (profileId, interest) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ interest_status: interest })
      .eq('id', profileId);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating interest status:', error);
    throw error;
  }
};
