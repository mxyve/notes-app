import axiosInstance from './axiosInstance';

// 创建笔记
export const createNote = async (noteData) => {
  return axiosInstance.post('/notes', noteData);
};

// 查询某个用户的所有笔记
export const getNotes = async (userId) => {
  return axiosInstance.get(`/notes/user/${userId}`);
};

export const getNote = async (noteId) => {
  return axiosInstance.get(`/notes/${noteId}`);
};

//查询某个用户某个分类的所有笔记
export const getNotesByCategory = async (userId, categoryId) => {
  return axiosInstance.get(`/notes/categories/${userId}/${categoryId}`);
};

// 更新笔记
export const updateNote = async (noteId, noteData) => {
  return axiosInstance.put(`/notes/${noteId}`, noteData);
};

// 删除笔记
export const deleteNote = async (noteId) => {
  return axiosInstance.delete(`/notes/${noteId}`);
};

// 查询笔记
export const searchNotes = async (userId, query) => {
  // 拼接包含 userId 的路径
  const url = `/notes/search/${userId}`;
  // 发送 GET 请求，将 query 作为查询参数
  return axiosInstance.get(url, { params: { keyword: query } });
};
