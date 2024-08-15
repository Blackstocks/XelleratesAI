"use client";

import React from "react";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import Icon from "@/components/ui/Icon";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Adjust the import path as necessary
import { supabase } from "@/lib/supabaseclient";

import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  sort,
  toggleColumnModal,
  deleteColumnBoard,
  setColumnId
} from "@/components/partials/app/kanban/store";
import Task from "@/components/partials/app/kanban/Task";
import AddColumn from "@/components/partials/app/kanban/AddColumn";
import AddTaskModal from "@/components/partials/app/kanban/AddTaskModal";
import { ToastContainer } from "react-toastify";
import EditTaskModal from "@/components/partials/app/kanban/EditTask";
import useCompleteUserDetails from "@/hooks/useCompleUserDetails";
import TaskCard from "@/components/partials/app/kanban/TaskCard";

const KanbanPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { columns,columnId, taskModal } = useSelector((state) => state.kanban);
  const dispatch = useDispatch();
  const [columnsList, setColumnsList] = useState([]);
  const { profile } = useCompleteUserDetails();
  const { loading, setLoading } = useState(false);
  const [  toggleTaskModal, setToggleTaskModal  ]=useState(false);
  // console.log(profile);

  useEffect(() => {
    if (user && profile?.id) {
      fetchColumnData(profile?.id);
    }
  }, [profile, columns]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    dispatch(sort(result));
  };

  const fetchColumnData = async (profile_id) => {
    // console.log(profile_id)
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch(
        `/api/column_kanban?profile_id=${profile_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "supabase-token": session.access_token,
          },
        }
      );
      const data = await response.json();
      setColumnsList(data.columns);
    } catch (error) {
      console.error("error in fetching column from database:", error);
    }
  };

  const deleteColumnData = async (id) => {
    // console.log(profile_idconsol
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch(`/api/column_kanban?id=${id}`, {
        headers: {
          "Content-Type": "application/json",
          "supabase-token": session.access_token,
        },
        method: "DELETE",
      });
      const data = await response.json();
      console.log(data);
      fetchColumnData(profile?.id);
    } catch (error) {
      console.error("error in deleting column from database:", error);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h4 className="font-medium lg:text-2xl text-xl capitalize text-slate-900 inline-block ltr:pr-4 rtl:pl-4">
          CRM
        </h4>
        <div className="flex space-x-4 justify-end items-center rtl:space-x-reverse">
          <Button
            icon="heroicons-outline:plus"
            text="Add Board"
            className="bg-slate-800 dark:hover:bg-opacity-70   h-min text-sm font-medium text-slate-50 hover:ring-2 hover:ring-opacity-80 ring-slate-900  hover:ring-offset-1  dark:hover:ring-0 dark:hover:ring-offset-0"
            iconclassName=" text-lg"
            onClick={() => dispatch(toggleColumnModal(true))}
          />
        </div>
      </div>

      <div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex space-x-6 overflow-hidden overflow-x-auto pb-4 rtl:space-x-reverse"
              >
                {columnsList?.map((column, i) => {
                  return (<>
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={i}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div
                            className={`w-[320px] flex-none h-full  rounded transition-all duration-100 ${
                              snapshot.isDragging
                                ? "shadow-xl bg-primary-300"
                                : "shadow-none bg-slate-200 dark:bg-slate-700"
                            } 
                       
                            `}
                          >
                            {/* Board Header*/}
                            <div className="relative flex justify-between items-center bg-white dark:bg-slate-800 rounded shadow-base px-6 py-5">
                              <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-[2px]"
                                style={{
                                  backgroundColor: column.color,
                                }}
                              ></div>
                              <div className="text-lg text-slate-900 dark:text-white font-medium capitalize">
                                {column.name}
                              </div>
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Tooltip
                                  placement="top"
                                  arrow
                                  theme="danger"
                                  content="Delete"
                                >
                                  <button
                                    className="border border-slate-200 dark:border-slate-700 dark:text-slate-400 rounded h-6 w-6 flex flex-col  items-center justify-center text-base text-slate-600"
                                    onClick={() => {
                                      dispatch(deleteColumnBoard(column.id));
                                      deleteColumnData(column?.id);
                                    }}
                                  >
                                    <Icon icon="heroicons-outline:trash" />
                                  </button>
                                </Tooltip>

                                <Tooltip
                                  placement="top"
                                  arrow
                                  theme="dark"
                                  content="Add Card"
                                >
                                  <button
                                    className="border border-slate-200 dark:border-slate-700 dark:text-slate-400 rounded h-6 w-6 flex flex-col  items-center justify-center text-base text-slate-600"
                                    onClick={() =>{
                                      setToggleTaskModal(true);
                                      dispatch(setColumnId(column?.id)) 
                                    }
                                    }
                                  >
                                    <Icon icon="heroicons-outline:plus-sm" />
                                  </button>
                                </Tooltip>
                              </div>
                            </div>
                            <Droppable
                              droppableId={column.id}
                              type="task"
                              direction="vertical"
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`px-2 py-4 h-full space-y-4  ${
                                    snapshot.isDraggingOver && "bg-primary-400"
                                  }`}
                                >
                                  <TaskCard column={column} profile_id={profile?.id} />
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  </>                  
                );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      <AddColumn profile_id={profile?.id} />
      <AddTaskModal setToggleTaskModal={setToggleTaskModal} toggleTaskModal={toggleTaskModal} column_id={columnId} profile_id={profile?.id}/>
      <EditTaskModal />
    </div>
  );
};

export default KanbanPage;
