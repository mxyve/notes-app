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
