import axiosInstance from './axiosInstance';

// 创建图片
export const createPicture = async (pictureData) => {
  return axiosInstance.post('/pictures', pictureData);
};

// 查询某个用户的所有图片
export const getPictures = async (userId) => {
  return axiosInstance.get(`/pictures/user/${userId}`);
};

// 获取单个图片
export const getPicture = async (id) => {
  console.log('Request URL:', id);
  return axiosInstance.get(`/pictures/${id}`);
};

// 更新图片
export const updataPicture = async (pictureId, pictureData) => {
  return axiosInstance.put(`/pictures/${pictureId}`, pictureData);
};

// 删除图片
export const deletePicture = async (pictureId) => {
  return axiosInstance.delete(`/pictures/${pictureId}`);
};
