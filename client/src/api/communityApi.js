import axiosInstance from './axiosInstance';

// 获取公开的笔记
export const getPublicNotes = async (page, limit, isPublic) => {
  const params = {
    page,
    limit,
  };
  // 只有当isPublic不是undefined时才添加该参数
  if (isPublic !== undefined) {
    params.is_public = isPublic;
  }

  return axiosInstance.get('/community', { params });
};
