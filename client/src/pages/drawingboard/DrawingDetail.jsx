import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Layout } from 'antd';
import { getPicture } from '@/api/pictureApi';
import GlobalModals from '@/components/GlobalModals';

const DrawingDetail = ({ children }) => {
  const { Content } = Layout;
  const { id } = useParams();
  const [picture, setPicture] = useState(null);
  console.log('pictureId', id);
  useEffect(() => {
    const fetchPictureDetail = async () => {
      try {
        const fetchedPicture = await getPicture(id);
        console.log(fetchedPicture);
        setPicture(fetchedPicture.data);
      } catch (error) {
        console.error('Failed to fetch picture details:', error);
        alert('获取详情失败');
      }
    };
    fetchPictureDetail();
  }, [id]);

  return (
    <Layout>
      <Navbar />
      <Content>
        <h1>{picture?.title || '暂无标题'}</h1>
        {picture?.contentBase64 && (
          <img
            src={`data:image/png;base64,${picture.contentBase64}`}
            alt="画板内容"
            style={{ maxWidth: '100%', height: 'auto' }} // 根据需要调整样式
          />
        )}
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default DrawingDetail;
