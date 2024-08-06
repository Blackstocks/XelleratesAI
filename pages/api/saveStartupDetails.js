// pages/api/saveStartupDetails.js

import { supabase } from '../../lib/supabaseclient';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { startupDetails } = req.body;

    try {
      // Save startup details to the database
      const { data, error } = await supabase.from('startup_details').insert([startupDetails]);

      if (error) {
        throw error;
      }

      res.status(200).json({ message: 'Startup details saved successfully', data });
    } catch (error) {
      res.status(500).json({ message: 'Error saving startup details', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
