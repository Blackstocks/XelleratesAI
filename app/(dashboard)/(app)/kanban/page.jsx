'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import Icon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseclient';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  sort,
  toggleColumnModal,
  deleteColumnBoard,
  setColumnId,
} from '@/components/partials/app/kanban/store';
import Task from '@/components/partials/app/kanban/Task';
import AddColumn from '@/components/partials/app/kanban/AddColumn';
import AddTaskModal from '@/components/partials/app/kanban/AddTaskModal';
import { ToastContainer } from 'react-toastify';
import EditTaskModal from '@/components/partials/app/kanban/EditTask';
import useCompleteUserDetails from '@/hooks/useCompleUserDetails';
import TaskCard from '@/components/partials/app/kanban/TaskCard';
import LoadingOverlay from '@/components/ui/LoadingOverlay'; // Import the loading overlay

const KanbanPage = () => {
  const { user } = useAuth();
  const { columns, columnId } = useSelector((state) => state.kanban);
  const dispatch = useDispatch();
  const [columnsList, setColumnsList] = useState([]);
  const { profile } = useCompleteUserDetails();
  const [toggleTaskModal, setToggleTaskModal] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [summary, setSummary] = useState('Summarizing your Tasks...'); // Summary state
  const [refreshing, setRefreshing] = useState(false); // Refresh button state

  useEffect(() => {
    if (user && profile?.id) {
      fetchColumnData(profile?.id).then(() => {});
    }
  }, [profile, columns]);

  const fetchColumnData = async (profile_id) => {
    try {
      setLoading(true); // Start loading
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch(
        `/api/column_kanban?profile_id=${profile_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'supabase-token': session.access_token,
          },
        }
      );
      const data = await response.json();

      const formattedColumns = await Promise.all(
        data.columns.map(async (column) => {
          const taskResponse = await fetch(
            `/api/task_kanban?column_id=${column.id}&profile_id=${profile_id}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'supabase-token': session.access_token,
              },
            }
          );
          const taskData = await taskResponse.json();

          return {
            ...column,
            tasks: taskData.tasks || [], // Ensure tasks array is present
          };
        })
      );

      setColumnsList(formattedColumns);
      setLoading(false); // Stop loading when data is fetched

      console.log('COL LIST: ', columnsList);

      if (columnsList.length > 1) {
        fetchTaskSummary();
      } // Fetch the summary only after the columns are loaded
      else {
        setSummary(
          "You don't have any tasks yet. You can add a new task by clicking the + button in the board or you can start by adding a new board."
        );
      }
    } catch (error) {
      console.error('Error in fetching columns from database:', error);
      setLoading(false); // Stop loading on error
    }
  };

  const fetchTaskSummary = async () => {
    try {
      setRefreshing(true); // Start refreshing state

      // Gather task data from the columnsList state
      const taskData = columnsList.map((column) => ({
        columnName: column.name,
        tasks: column.tasks.map((task) => ({
          title: task.name,
          description: task.description,
          startDate: task.start_date,
          dueDate: task.end_date,
        })),
      }));

      console.log('TASK DATA: ', taskData);
      const response = await fetch(`/api/generateTaskSummary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: taskData }),
      });

      const data = await response.json();
      setSummary(data.summary);
      setRefreshing(false); // Stop refreshing state
    } catch (error) {
      console.error('Error fetching summary:', error);
      setRefreshing(false); // Stop refreshing on error
    }
  };

  const deleteColumnData = async (id) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch(`/api/column_kanban?id=${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'supabase-token': session.access_token,
        },
        method: 'DELETE',
      });
      await response.json();
      fetchColumnData(profile?.id);
    } catch (error) {
      console.error('Error in deleting column from database:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const sourceColumnIndex = columnsList.findIndex(
      (column) => column.id === source.droppableId
    );
    const destinationColumnIndex = columnsList.findIndex(
      (column) => column.id === destination.droppableId
    );

    if (sourceColumnIndex === -1 || destinationColumnIndex === -1) {
      console.error('Source or destination column not found');
      return;
    }

    const sourceColumn = { ...columnsList[sourceColumnIndex] };
    const destinationColumn = { ...columnsList[destinationColumnIndex] };

    const taskIndex = sourceColumn.tasks.findIndex(
      (task) => task.id === draggableId
    );

    if (taskIndex === -1) {
      console.error('Task not found in source column');
      return;
    }

    const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
    destinationColumn.tasks.splice(destination.index, 0, movedTask);

    const newColumnsList = [...columnsList];
    newColumnsList[sourceColumnIndex] = sourceColumn;
    newColumnsList[destinationColumnIndex] = destinationColumn;

    setColumnsList(newColumnsList);

    // Update the database and then reload the page
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ column_id: destination.droppableId })
        .eq('id', draggableId);

      if (error) {
        console.error('Error updating task in database:', error);
      } else {
        // fetchTaskSummary(); // Automatically fetch the summary after drag-and-drop
      }
    } catch (error) {
      console.error('Unexpected error during task update:', error);
    }
  };

  return (
    <div>
      {/* <ToastContainer /> */}
      {loading && <LoadingOverlay />} {/* Show loading overlay while loading */}
      <div className='flex flex-wrap justify-between items-center mb-4'>
        <h4 className='font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4'>
          CRM
        </h4>
        <div className='flex space-x-4 justify-end items-center rtl:space-x-reverse'>
          <Button
            icon='heroicons-outline:plus'
            text='Add Board'
            className='bg-slate-900 dark:hover:bg-opacity-70 h-min text-sm font-medium text-slate-50 hover:ring-2 hover:ring-opacity-80 ring-slate-900 hover:ring-offset-1 dark:hover:ring-0 dark:hover:ring-offset-0'
            iconclassName='text-lg'
            onClick={() => dispatch(toggleColumnModal(true))}
          />
        </div>
      </div>
      {/* Today's Summary Section */}
      <div className='flex flex-col items-center mb-4 bg-white dark:bg-slate-900 rounded shadow-base p-4 w-3/5 mx-auto'>
        <div className='text-center'>
          <h4 className='font-semibold lg:text-2xl text-xl text-slate-900 dark:text-white'>
            Today's Summary
          </h4>
          <p className='text-md text-slate-700 dark:text-slate-300 mt-2'>
            {summary || 'Summarising your tasks...'}
          </p>
        </div>
        {/* <Button
    icon="heroicons-outline:refresh"
    className="bg-slate-900 dark:bg-slate-600 hover:bg-slate-700 text-sm text-white mt-4 flex items-center justify-center w-10 h-10 rounded-full"
    onClick={fetchTaskSummary} 
    disabled={refreshing}
  >
    <Icon icon="heroicons-outline:refresh" />
  </Button> */}
      </div>
      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId='all-lists' direction='horizontal' type='list'>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className='flex space-x-6 overflow-hidden overflow-x-auto pb-4 rtl:space-x-reverse'
              >
                {columnsList?.map((column, i) => (
                  <Draggable key={column.id} draggableId={column.id} index={i}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div
                          className={`w-[320px] flex-none h-full rounded transition-all duration-100 ${
                            snapshot.isDragging
                              ? 'shadow-xl bg-primary-300'
                              : 'shadow-none bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          {/* Board Header */}
                          <div className='relative flex justify-between items-center bg-white dark:bg-slate-900 rounded shadow-base px-6 py-5'>
                            <div
                              className='absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[2px]'
                              style={{
                                backgroundColor: column.color,
                              }}
                            ></div>
                            <div className='text-lg text-slate-900 dark:text-white font-medium capitalize'>
                              {column.name}
                            </div>
                            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
                              <Tooltip
                                placement='top'
                                arrow
                                theme='danger'
                                content='Delete'
                              >
                                <button
                                  className='border border-slate-200 dark:border-slate-700 dark:text-slate-400 rounded h-6 w-6 flex flex-col items-center justify-center text-base text-slate-600'
                                  onClick={() => {
                                    dispatch(deleteColumnBoard(column.id));
                                    deleteColumnData(column?.id);
                                  }}
                                >
                                  <Icon icon='heroicons-outline:trash' />
                                </button>
                              </Tooltip>

                              <Tooltip
                                placement='top'
                                arrow
                                theme='dark'
                                content='Add Card'
                              >
                                <button
                                  className='border border-slate-200 dark:border-slate-700 dark:text-slate-400 rounded h-6 w-6 flex flex-col items-center justify-center text-base text-slate-600'
                                  onClick={() => {
                                    setToggleTaskModal(true);
                                    dispatch(setColumnId(column?.id));
                                  }}
                                >
                                  <Icon icon='heroicons-outline:plus-sm' />
                                </button>
                              </Tooltip>
                            </div>
                          </div>
                          <Droppable
                            droppableId={column.id}
                            type='task'
                            direction='vertical'
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`px-2 py-4 h-full space-y-4 ${
                                  snapshot.isDraggingOver && 'bg-primary-400'
                                }`}
                              >
                                <TaskCard
                                  column={column}
                                  profile_id={profile?.id}
                                />
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <AddColumn profile_id={profile?.id} />
      <AddTaskModal
        setToggleTaskModal={setToggleTaskModal}
        toggleTaskModal={toggleTaskModal}
        column_id={columnId}
        profile_id={profile?.id}
        fetchTaskSummary={fetchTaskSummary}
      />
      <EditTaskModal fetchTaskSummary={fetchTaskSummary} />
    </div>
  );
};

export default KanbanPage;
