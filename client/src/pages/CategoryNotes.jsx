import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Layout, Button, Space, Modal, message } from 'antd';
import { getNotesByCategory, deleteNote } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const CategoryNotes = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [notes, setNotes] = useState([]);
  const { Content } = Layout;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  const fetchNotesByCategory = async () => {
    try {
      const fetchedNotes = await getNotesByCategory(user.id, categoryId);
      console.log('Fetched fetchedNotes:', fetchedNotes.data);
      setNotes(fetchedNotes.data);
    } catch (error) {
      console.error('Failed to fetch notes by category:', error);
      alert('获取笔记失败');
    }
  };
  useEffect(() => {
    fetchNotesByCategory();
  }, [categoryId]);

  if (!notes) return <div>Loading...</div>;

  return (
    <Layout>
      <Navbar />
      <Content>
        <h1>分类笔记列表</h1>
        <Button type="primary" onClick={() => navigate('/create-note')}>
          创建笔记
        </Button>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={notes}
          renderItem={(item) => (
            <Card className="bg-blue-100 m-2">
              <Card.Meta
                title={item.title}
                description={item.content.substring(0, 60) + '...'}
              />
              {item.tags && item.tags.length > 0 && (
                <div className="tags-container">
                  {item.tags.map((tag) => (
                    <Tag color="cyan" key={tag}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
              <Space>
                <a href={`/notes/${item.id}`}>査看详情</a>
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
              fetchNotesByCategory();
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
    </Layout>
  );
};

export default CategoryNotes;
