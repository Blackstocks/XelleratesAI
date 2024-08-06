import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, mobile, company_name, linkedin_profile } = req.body;

    console.log('Received data:', req.body); // Log the received data

    try {
      const { data, error } = await supabase.from('connected_startups').insert([
        {
          name,
          email,
          mobile,
          company_name,
          linkedin_profile,
        },
      ]);

      if (error) {
        console.error('Error inserting data:', error); // Log the error
        throw error;
      }

      console.log('Data inserted:', data); // Log the inserted data
      res.status(200).json({ message: 'Data inserted successfully', data });
    } catch (error) {
      console.error('Unexpected error:', error.message); // Log any unexpected error
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
