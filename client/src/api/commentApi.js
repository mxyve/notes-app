import axiosInstance from './axiosInstance';

export const createComment = async (commentData) => {
  return axiosInstance.post('/comment', commentData);
};

export const getComments = async (noteId, config) => {
  return axiosInstance.get(`/comment/${noteId}`, config);
};

export const deleteComment = async (id) => {
  return axiosInstance.delete(`/comment/${id}`);
};

export const updateCommentLike = async (id, userId, noteId) => {
  return axiosInstance.put(`/comment/like/${id}`, {
    userId,
    noteId,
  });
};
