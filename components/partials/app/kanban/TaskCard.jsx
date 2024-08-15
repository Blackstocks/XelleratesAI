"use client";
import React, { useEffect, useState } from "react";
import Task from "./Task";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { supabase } from "@/lib/supabaseclient";
import { useSelector } from "react-redux";


const TaskCard = ({ column ,profile_id}) => {
  const [tasks,setTasks]=useState([]);
  const { taskTag } = useSelector((state) => state.kanban);


  useEffect(()=>{
     fetchTasks(column.id)
  },[taskTag])

  const fetchTasks = async (column_id) => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      const response = await fetch(
        `/api/task_kanban?column_id=${column_id}&profile_id=${profile_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            "supabase-token": session.access_token,
          },
        }
      );
      const data = await response.json();
      setTasks(data.tasks);

    } catch (error) {
      console.error("error in fetcging tasks from database:", error);
    }
  };

  return (
    <>
      {tasks?.map((task, ind) => (
        <Draggable key={ind} draggableId={task.id} index={ind}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <Task task={task} />
            </div>
          )}
        </Draggable>
      ))}
    </>
  );
};

export default TaskCard;
