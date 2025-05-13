import axiosInstance from './axiosInstance';

// 创建待办项
export const createTodoList = async (todoList) => {
  return axiosInstance.post('/todolist', todoList);
};

// 获取某个用户的所有待办项
export const getTodoLists = async (userId, tagId, isFinish) => {
  return axiosInstance.get(`/todolist/user/${userId}`, {
    params: { tagId, isFinish },
  });
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

// 上传图片
export const uploadImage = async (file) => {
  return axiosInstance.post(`/todolist/upload`, file);
};

// 删除标签
export const deleteTag = async (userId, tagId) => {
  return axiosInstance.delete(`/todolist/delete/${userId}`, {
    params: { tagId },
  });
};

// 创建标签
export const createTag = async (userId, tagData) => {
  return axiosInstance.post(`/todolist/create/${userId}`, tagData);
};

// 修改标签
export const updateTag = async (id, tagData) => {
  return axiosInstance.put(`/todolist/updateTag/${id}`, tagData);
};
