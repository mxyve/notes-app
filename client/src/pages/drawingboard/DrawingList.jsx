import React, { useEffect, useState } from 'react';
import { Layout, Button, Card, List, Modal, message, Avatar } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import { getPictures, deletePicture } from '@/api/pictureApi';
import GlobalModals from '@/components/GlobalModals';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';

const DrawingList = () => {
  const { Content } = Layout;
  const { user } = useStore();
  const navigate = useNavigate();

  const [pictures, setPictures] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPictureId, setSelectedPictureId] = useState(null);

  // 格式化图片数据为Base64
  const formatImageData = (bufferData) => {
    if (!bufferData || !bufferData.data) return '';
    const base64 = btoa(
      new Uint8Array(bufferData.data).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        '',
      ),
    );
    return `data:image/png;base64,${base64}`;
  };

  // 获取列表数据
  const fetchPicturesData = async () => {
    try {
      const response = await getPictures(user.id);
      console.log('Fetched pictures:', response.data);

      // 处理图片数据
      const formattedPictures = response.data.map((picture) => ({
        ...picture,
        imageUrl: formatImageData(picture.content),
      }));

      setPictures(formattedPictures);
    } catch (error) {
      console.error('Failed to fetch pictures:', error);
      message.error('获取列表失败');
    }
  };

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchPicturesData();
  }, [user, navigate]);

  return (
    <Layout>
      <Navbar />
      <Content>
        <div>
          <h1>我的绘图</h1>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate('/drawing-create')}
          >
            创建新绘图
          </Button>
        </div>

        <div>
          <List
            dataSource={pictures}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
            renderItem={(item) => (
              <Card
                className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white"
                hoverable
              >
                {/* 图片区域 */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://picsum.photos/400/300'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    style={{ height: '200px', width: '100%' }}
                  />
                </div>

                {/* 卡片内容 */}
                <Card.Meta
                  title={
                    <a
                      href={`/drawing-detail/${item.id}`}
                      className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                    >
                      {item.title || '未命名绘图'}
                    </a>
                  }
                  className="py-3"
                />

                {/* 操作按钮 */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <Button
                    icon={<EyeOutlined />}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/drawing-detail/${item.id}`)}
                  >
                    查看
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                    onClick={() => {
                      setModalVisible(true);
                      setSelectedPictureId(item.id);
                    }}
                  />
                </div>
              </Card>
            )}
          />
        </div>

        {/* 删除确认模态框 */}
        <Modal
          title="确认删除"
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
          okButtonProps={{ danger: true }}
        >
          <p className="text-gray-700">确定要删除此绘图吗？此操作无法撤销。</p>
        </Modal>
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default DrawingList;
