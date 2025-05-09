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

// 我的关注
export const getFollows = async (userId) => {
  return axiosInstance.get(`/community/follows/${userId}`);
};

// 我的粉丝
export const getUserFollowers = async (userId) => {
  return axiosInstance.get(`/community/userfollowers/${userId}`);
};

// 关注取关
export const updateFollows = async (userId, followerId) => {
  return axiosInstance.put(`/community/updateFollows/${userId}`, {
    followerId,
  });
};

// 获取关注状态
export const getFollowStatus = async (userId, followerId) => {
  return axiosInstance.get(`/community/getFollow/${userId}/${followerId}`);
};
