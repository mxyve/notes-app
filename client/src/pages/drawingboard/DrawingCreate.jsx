import React from 'react';
import { Layout, message } from 'antd';
import Navbar from '@/components/Navbar';
import { createPicture } from '@/api/pictureApi';
import { useStore } from '@/store/userStore';
import GlobalModals from '@/components/GlobalModals';
import CanvasDrawer from './components/CanvasDrawer';

const DrawingPage = () => {
  const { Content } = Layout;
  const { user } = useStore();

  const handleSaveToDatabase = async ({ dataURL, title }) => {
    try {
      // 将 dataURL 转换为 Blob 对象
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const file = new File([blob], `${title || 'drawing'}.png`, {
        type: 'image/png',
      });

      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('userId', user.id);

      // 发送请求
      await createPicture(formData);
      message.success('绘图已保存到数据库');
    } catch (error) {
      console.error('保存到数据库失败:', error);
      message.error('保存到数据库失败');
    }
  };

  const handleDownload = ({ title }) => {
    message.info(`"${title || '绘图'}" 已下载到本地`);
  };

  return (
    <Layout>
      <Navbar />
      <Content style={{ padding: '20px' }}>
        <CanvasDrawer
          width={1000}
          height={700}
          onSaveToDatabase={handleSaveToDatabase}
          onDownload={handleDownload}
          initialTitle="我的绘图"
        />
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default DrawingPage;
