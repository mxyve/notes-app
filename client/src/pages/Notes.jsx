// 分类的笔记列表

import { useEffect, useState } from 'react';
import { List, Card, Tag, Button, Modal, message, Space, Layout } from 'antd';
import { getNotes, deleteNote } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import GlobalModals from '@/components/GlobalModals';

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const { Content } = Layout;
  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  // 获取分类的笔记
  const fetchNotes = async () => {
    try {
      const fetchNotesData = await getNotes(user.id);
      setNotes(fetchNotesData.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      alert('获取笔记失败');
    }
  };
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <Layout>
      <Navbar />
      <Content>
        <div className="flex justify-between items-center p-6">
          <h1>笔记列表</h1>
          <Button type="primary" onClick={() => navigate('/create-note')}>
            创建笔记
          </Button>
        </div>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={notes}
          className="p-4"
          renderItem={(item) => (
            <Card className="bg-blue-100 m-2" hoverable>
              <Card.Meta
                title={item.title}
                description={item.content.substring(0, 100) + '...'}
              />
              <div className="my-4">
                {item.tags.map((tag) => (
                  <Tag color="cyan" key={tag}>
                    {tag}
                  </Tag>
                ))}
              </div>
              <Space>
                <a href={`/notes/${item.id}`}>点击査看详情</a>
                <Button
                  type="primary"
                  onClick={() => navigate(`/notes/edit/${item.id}`)}
                >
                  编辑
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setModalVisible(true);
                    setSelectedNoteId(item.id);
                  }}
                >
                  删除
                </Button>
              </Space>
            </Card>
          )}
        />
        <Modal
          title="确认删除"
          open={modalVisible}
          onOk={async () => {
            try {
              await deleteNote(selectedNoteId);
              message.success('笔记删除成功');
              fetchNotes();
            } catch (error) {
              console.error('Failed to delete note: ', error);
              message.error('删除笔记失败');
            } finally {
              setModalVisible(false);
              setSelectedNoteId(null);
            }
          }}
          onCancel={() => {
            setModalVisible(false);
            setSelectedNoteId(null);
          }}
        >
          <p>确定删除这条笔记吗？ 此操作不可恢复。</p>
        </Modal>
      </Content>
      <GlobalModals />
    </Layout>
  );
};
export default Notes;
