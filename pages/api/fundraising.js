// pages/api/fundraising.js
import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, sector, location, stage, teamSize, incorporationDate, founderName } = req.body;

    try {
      const { data, error } = await supabase.from('startups').insert([
        { name, sector, location, stage, teamSize, incorporationDate, founderName },
      ]);

      if (error) throw error;

      res.status(200).json({ message: 'Startup details saved successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
