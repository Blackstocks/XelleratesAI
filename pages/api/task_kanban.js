import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  switch (req.method) {
    case 'POST': // Add a new task
      await addTask(req, res);
      break;
    case 'PUT': // Edit an existing task
      await editTask(req, res);
      break;
    case 'DELETE': // Delete a task
      await deleteTask(req, res);
      break;
    case 'GET': // Fetch tasks based on column_id
      await fetchTasks(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'PUT', 'DELETE', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Add a new task
async function addTask(req, res) {
  const { name, description, start_date, end_date, progress, column_id, profile_id, assigned_id, assigned_email, tags } = req.body;

  try {
    const { data, error } = await supabase.from('tasks').insert([
      {
        name,
        description,
        start_date,
        end_date,
        progress,
        column_id,
        profile_id,
        assigned_id,
        assigned_email,
        tags,
      },
    ]);

    if (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: error.message });
    } else {
      console.log('Task added:', data);
      res.status(200).json({ message: 'Task added successfully', data });
    }
  } catch (error) {
    console.error('Unexpected error adding task:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
}

// Fetch tasks based on column_id
async function fetchTasks(req, res) {
    const { column_id, profile_id } = req.query;
  
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('column_id', column_id)
        .eq('profile_id', profile_id);
  
      if (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
      } else {
        console.log('Tasks fetched:', data);
        res.status(200).json({ tasks: data });
      }
    } catch (error) {
      console.error('Unexpected error fetching tasks:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
    }
  }
  

// Edit an existing task
async function editTask(req, res) {
  const { id, name, description, start_date, end_date, progress, column_id, profile_id, assigned_id, assigned_email, tags } = req.body;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        name,
        description,
        start_date,
        end_date,
        progress,
        column_id,
        profile_id,
        assigned_id,
        assigned_email,
        tags,
      })
      .eq('id', id);

    if (error) {
      console.error('Error editing task:', error);
      res.status(500).json({ error: error.message });
    } else {
      console.log('Task updated:', data);
      res.status(200).json({ message: 'Task updated successfully', data });
    }
  } catch (error) {
    console.error('Unexpected error editing task:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
}

// Delete a task
async function deleteTask(req, res) {
  const { id } = req.query;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: error.message });
    } else {
      console.log('Task deleted:', data);
      res.status(200).json({ message: 'Task deleted successfully', data });
    }
  } catch (error) {
    console.error('Unexpected error deleting task:', error);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
}
