import React, { useEffect, useState } from 'react';
import { Layout, Button, Card, List, Modal, message } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import { getPictures, deletePicture } from '@/api/pictureApi';
import GlobalModals from '@/components/GlobalModals';

const DrawingList = ({ children }) => {
  const { Content } = Layout;
  const { user } = useStore();
  const navigate = useNavigate();

  const [pictures, setPictures] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPictureId, setSelectedPictureId] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);
  console.log('User ID:', user.id);
  // 获取列表数据
  const fetchPicturesData = async () => {
    try {
      const fetchedPictures = await getPictures(user.id);
      console.log('Fetched pictures:', fetchedPictures.data);
      setPictures(fetchedPictures.data);
    } catch (error) {
      console.error('Failed to fetch pictures:', error);
      alert('获取列表失败');
    }
  };
  useEffect(() => {
    fetchPicturesData();
  }, [user]);

  return (
    <Layout>
      <Navbar />
      <Content>
        {' '}
        <h1>画板</h1>
        <Button type="primary" onClick={() => navigate('/drawing-create')}>
          创建画板
        </Button>
        <div>
          <List
            dataSource={pictures}
            renderItem={(item) => (
              <Card>
                <a href={`/drawing-detail/${item.id}`}>
                  <Card.Meta title={item.title} />
                </a>
                <Button
                  onClick={() => {
                    setModalVisible(true);
                    setSelectedPictureId(item.id);
                  }}
                >
                  删除
                </Button>
              </Card>
            )}
          />
        </div>
        <Modal
          title="确定删除"
          open={modalVisible}
          onOk={async () => {
            try {
              await deletePicture(selectedPictureId);
              message.success('删除成功');
              fetchPicturesData();
            } catch (error) {
              console.error('Failed to delete note:', error);
              message.error('删除失败');
            } finally {
              setModalVisible(false);
              setSelectedPictureId(null);
            }
          }}
          onCancel={() => {
            setModalVisible(false);
            setSelectedPictureId(null);
          }}
        >
          <p>确定删除吗？</p>
        </Modal>
      </Content>
      <GlobalModals />
    </Layout>
  );
};
export default DrawingList;
