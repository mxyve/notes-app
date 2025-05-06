import axiosInstance from './axiosInstance';

// 创建笔记
export const createNote = async (noteData) => {
  return axiosInstance.post('/notes', noteData);
};

// 查询某个用户的所有笔记
export const getNotes = async (userId, isDelete) => {
  return axiosInstance.get(`/notes/user/${userId}`, { params: { isDelete } });
};

// 获取单个笔记
export const getNote = async (noteId, config) => {
  return axiosInstance.get(`/notes/${noteId}`, config);
};

//查询某个用户某个分类的所有笔记
export const getNotesByCategory = async (userId, categoryId, isDelete) => {
  return axiosInstance.get(`/notes/categories/${userId}/${categoryId}`, {
    params: { isDelete },
  });
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
export const searchNotes = async (userId, keyword, tags) => {
  // 拼接包含 userId 的路径
  const url = `/notes/search/${userId}`;
  // 构建查询参数对象
  const params = { keyword };
  // 如果 tags 存在，添加到查询参数中
  if (tags && tags.length > 0) {
    params.tags = tags;
  }
  console.log('params:', params);
  // 发送 GET 请求，将 query 作为查询参数
  return axiosInstance.get(url, { params });
};

// 查询标签
export const getTags = async (userId) => {
  return axiosInstance.get(`/notes/tags/${userId}`);
};

// 点赞
export const updateNoteLike = async (id, userId) => {
  return axiosInstance.put(`/notes/like/${id}`, {
    userId,
  });
};

// 收藏
export const updateNoteCollection = async (id, userId) => {
  return axiosInstance.put(`/notes/collect/${id}`, {
    userId,
  });
};
