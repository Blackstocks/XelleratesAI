import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST': // Add a new column
      await addColumn(req, res);
      break;
    case 'PUT': // Edit an existing column
      await editColumn(req, res);
      break;
    case 'DELETE': // Delete a column
      await deleteColumn(req, res);
      break;
    case 'GET': // Fetch columns
      await fetchColumns(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Add a new column
async function addColumn(req, res) {
  const { profile_id, name, color } = req.body;

  try {
    const { data, error } = await supabase.from('columns').insert([
      {
        name: name,
        color: color,
        profile_id: profile_id,
      },
    ]);

    if (error) {
      console.error('Error adding column:', error);
      res.status(500).json({ error: error.message });
    } else {
      console.log('column added:', data);
      res.status(200).json({ message: 'column added successfully', data });
    }
  } catch (error) {
    console.error('Unexpected error adding column:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
}

// Edit an existing column
async function editColumn(req, res) {
  const { id, name, color } = req.body;

  try {
    const { data, error } = await supabase
      .from('columns')
      .update({ name, color })
      .eq('id', id);

    if (error) {
      console.error('Error editing column:', error);
      res.status(500).json({ error: error.message });
    } else {
      console.log('column updated:', data);
      res.status(200).json({ message: 'column updated successfully', data });
    }
  } catch (error) {
    console.error('Unexpected error editing column:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
}

// Delete a column
async function deleteColumn(req, res) {
  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('columns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting column:', error);
      res.status(500).json({ error: error.message });
    } else {
      console.log('column deleted:', data);
      res.status(200).json({ message: 'column deleted successfully', data });
    }
  } catch (error) {
    console.error('Unexpected error deleting column:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
}

// Fetch all columns
async function fetchColumns(req, res) {
  const { profile_id } = req.query;

  try {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('profile_id', profile_id);

    if (error) {
      console.error('Error fetching columns:', error);
      res.status(500).json({ error: error.message });
    } else {
      console.log('columns fetched:', data);
      res.status(200).json({ columns: data });
    }
  } catch (error) {
    console.error('Unexpected error fetching columns:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
}
