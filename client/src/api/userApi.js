import axiosInstance from './axiosInstance';

export const registerUser = async (userData) => {
  return axiosInstance.post('/users/register', userData);
};

export const loginUser = async (userData) => {
  return axiosInstance.post('/users/login', userData);
};

export const getUser = async (userId) => {
  return axiosInstance.get(`/users/${userId}`);
};

export const getUsers = async () => {
  return axiosInstance.get('/users');
};

// 更新用户信息
export const updateUser = async (id, userData) => {
  return axiosInstance.put(`/users/update/${id}`, userData);
};

// 更新用户头像
export const updateUserAvatar = async (userId, file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  return axiosInstance.post(`/users/avatar/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
