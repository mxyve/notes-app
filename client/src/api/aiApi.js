import axiosInstance from './axiosInstance';

export const chat = async (systemContent, userMessage) => {
  try {
    const response = await axiosInstance.post('/ai/chat', {
      systemContent,
      userMessage,
    });
    return response.data.message;
  } catch (error) {
    console.error('调用聊天接口时发生错误：', error);
    throw error;
  }
};

// 传图识字
export const ocr = async (image) => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    const response = await axiosInstance.post('/ai/ocr', formData);
    return response.data.message;
  } catch (error) {
    console.error('调用 ocr 接口失败', error);
    throw error;
  }
};
