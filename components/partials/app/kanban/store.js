import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

import { toast } from "react-toastify";

export const appKanbanSlice = createSlice({
  name: "appkanban",
  initialState: {
    columModal: false,
    taskModal: false,
    isLoading: null,
    openTaskId: null,

    // for edit
    columnId:"",
    editModal: false,
    editItem: {},
    columns: [],
    isLoading: false,
    taskTag:false,
  },
  reducers: {
    updateTaskTag:(state,action)=>{
      state.taskTag = action.payload;
    },
    setColumnId:(state,action)=>{
      state.columnId=action.payload;
    },
    toggleColumnModal: (state, action) => {
      state.columModal = action.payload;
    },
    addColumnBoard: (state, action) => {
      state.columns.push({
        id: uuidv4(),
        name: action.payload.title,
        color: action.payload.color,
        tasks: [],
      });

      toast.success("Add Successfully", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    },
    deleteColumnBoard: (state, action) => {
      const index = state.columns.findIndex(
        (column) => column.id === action.payload
      );
      state.columns.splice(index, 1);
    },
    toggleTaskModal: (state, action) => {
      const { columnId, open } = action.payload;
      state.taskModal = open;
      state.openTaskId = columnId;
    },
    addTask: (state, action) => {
      const column = state.columns.find(
        (column) => column.id === state.openTaskId
      );
      column.tasks.push(action.payload);
    },
    deleteTask: (state, action) => {
      const column = state.columns.find(
        (item) =>
          item.tasks.findIndex(
            (innerItem) => innerItem.id === action.payload
          ) !== -1
      );

      if (column) {
        const index = column.tasks.findIndex(
          (innerItem) => innerItem.id === action.payload
        );
        column.tasks.splice(index, 1);
        toast.warning("Delete Successfully", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    },
    // toggleEditModal
    toggleEditModal: (state, action) => {
      const { task, editModal } = action.payload;
      state.editModal = editModal;
      state.editItem = task;
    },
    updateTask: (state, action) => {
      // update task
      const column = state.columns.find(
        (item) =>
          item.tasks.findIndex(
            (innerItem) => innerItem.id === action.payload.id
          ) !== -1
      );

      if (column) {
        const index = column.tasks.findIndex(
          (innerItem) => innerItem.id === action.payload.id
        );
        column.tasks[index] = action.payload;

        toast.info("Edit Successfully", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      }
    },
  },
});

export const {
  sort,
  toggleColumnModal,
  addColumnBoard,
  deleteColumnBoard,
  addTask,
  toggleTaskModal,
  deleteTask,
  toggleEditModal,
  updateTask,
  setColumnId,
  updateTaskTag,
} = appKanbanSlice.actions;
export default appKanbanSlice.reducer;
