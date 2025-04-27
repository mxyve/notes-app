import axiosInstance from './axiosInstance';

// 创建待办项
export const createTodoList = async (todoList) => {
  return axiosInstance.post('/todolist', todoList);
};

// 获取某个用户的所有待办项
export const getTodoLists = async (userId) => {
  return axiosInstance.get(`/todolist/user/${userId}`);
};

// 获取单个待办项
export const getTodoList = async (todoListId) => {
  return axiosInstance.get(`/todolist/${todoListId}`);
};

// 更新待办项
export const updateTodoList = async (todoListId, todoListData) => {
  return axiosInstance.put(`/todolist/${todoListId}`, todoListData);
};

// 删除待办项
export const deleteTodoList = async (todoListId) => {
  return axiosInstance.delete(`/todolist/${todoListId}`);
};

// 获取标签
export const getTags = async (userId) => {
  return axiosInstance.get(`/todolist/tags/${userId}`);
};
