import axiosInstance from './axiosInstance';

export const getLikeNote = async (userId) => {
  return axiosInstance.get(`/home/user/like/${userId}`);
};

export const getCollectNote = async (userId) => {
  return axiosInstance.get(`/home/user/collect/${userId}`);
};

export const getMyComments = async (userId) => {
  return axiosInstance.get(`/home/user/comment/${userId}`);
};

// 点赞数
export const getLikeCount = async (userId) => {
  return axiosInstance.get(`/home/user/likeCount/${userId}`);
};

// 收藏数
export const getCollectCount = async (userId) => {
  return axiosInstance.get(`/home/user/collectionCount/${userId}`);
};
