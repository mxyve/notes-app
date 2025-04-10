import axiosInstance from './axiosInstance';

// 新建分类
export const createCategory = async (categoryData) => {
  return axiosInstance.post('/categories', categoryData);
};

// 获取所有分类
export const getCategories = async () => {
  return axiosInstance.get('/categories');
};

export const getCategory = async (categoryId) => {
  return axiosInstance.get(`/categories/${categoryId}`);
};

export const updateCategory = async (categoryId, categoryData) => {
  return axiosInstance.put(`/categories/${categoryId}`, categoryData);
};

// 删除分类
export const deleteCategory = async (categoryId) => {
  return axiosInstance.delete(`/categories/${categoryId}`);
};
