// lib/supabaseApi.js

import { supabase } from './supabaseclient';

// Function to add a new board
export const addBoard = async (userId, boardName) => {
  const { data, error } = await supabase
    .from('boards')
    .insert([{ user_id: userId, name: boardName }]);

  if (error) {
    console.error('Error adding board:', error.message);
    return null;
  }
  return data;
};

// Function to add a new column
export const addColumn = async (boardId, columnName, columnColor) => {
    const { data, error } = await supabase
      .from('columns')
      .insert([{ board_id: boardId, name: columnName, color: columnColor }]);
  
    if (error) {
      console.error('Error adding column:', error.message);
      return null;
    }
    return data;
  };

// Function to add a new task
export const addTask = async (columnId, taskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      column_id: columnId,
      name: taskData.name,
      assignee: taskData.assignee,
      start_date: taskData.start_date,
      end_date: taskData.end_date,
      progress: taskData.progress
    }]);

  if (error) {
    console.error('Error adding task:', error.message);
    return null;
  }
  return data;
};

// Function to get all boards for a specific user
export const getBoards = async (userId) => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching boards:', error.message);
    return null;
  }
  return data;
};

// Function to get all columns for a specific board
export const getColumns = async (boardId) => {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId);

  if (error) {
    console.error('Error fetching columns:', error.message);
    return null;
  }
  return data;
};

// Function to get all tasks for a specific column
export const getTasks = async (columnId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('column_id', columnId);

  if (error) {
    console.error('Error fetching tasks:', error.message);
    return null;
  }
  return data;
};
