import React, { useEffect, useState } from 'react';
import { Layout, Button, Card, List, Modal, message, Typography } from 'antd';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import { getPictures, deletePicture } from '@/api/pictureApi';
import GlobalModals from '@/components/GlobalModals';
import Navbar from '@/components/Navbar';

const { Content } = Layout;
const { Text } = Typography;

const DrawingList = () => {
  const { user } = useStore();
  const navigate = useNavigate();

  const [pictures, setPictures] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPictureId, setSelectedPictureId] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  // 获取列表数据
  const fetchPicturesData = async () => {
    try {
      const fetchedPictures = await getPictures(user.id);
      setPictures(fetchedPictures.data || []);
    } catch (error) {
      console.error('Failed to fetch pictures:', error);
      message.error('获取列表失败');
    }
  };

  useEffect(() => {
    fetchPicturesData();
  }, [user]);

  return (
    <Layout className="bg-gray-50 min-h-screen">
      <Navbar />
      <Content className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">画板</h1>
          <Button
            type="primary"
            onClick={() => navigate('/drawing-create')}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            创建画板
          </Button>
        </div>

        <List
          grid={{ gutter: 16, column: 3 }}
          dataSource={pictures}
          renderItem={(item) => (
            <List.Item>
              <Card
                className="w-full"
                hoverable
                cover={
                  <img
                    src={item.imageUrl || '/default-image.jpg'}
                    alt={item.title}
                    className="w-60 h-40 object-cover"
                  />
                }
              >
                <Card.Meta
                  title={
                    <Text className="text-lg font-medium">{item.title}</Text>
                  }
                  description={
                    <Text className="text-gray-500">{item.description}</Text>
                  }
                />
                <div className="flex justify-end">
                  <Button
                    type="link"
                    onClick={() => {
                      setModalVisible(true);
                      setSelectedPictureId(item.id);
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    删除
                  </Button>
                </div>
              </Card>
            </List.Item>
          )}
        />

        <Modal
          title="确定删除"
          open={modalVisible}
          onOk={async () => {
            try {
              await deletePicture(selectedPictureId);
              message.success('删除成功');
              fetchPicturesData();
            } catch (error) {
              console.error('Failed to delete picture:', error);
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
          <p className="text-gray-700">确定删除吗？</p>
        </Modal>
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default DrawingList;
