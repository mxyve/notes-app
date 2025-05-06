import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Layout, Button, Space, Modal, message } from 'antd';
import { getNotesByCategory, updateNote } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';

// 封装笔记项组件
const NoteItem = ({ item, onDelete }) => {
  return (
    <>
      <Card className="bg-blue-100 m-2">
        <a href={`/notes/edit/${item.id}`}>
          <Card.Meta
            title={item.title}
            description={item.content.substring(0, 60) + '...'}
          />
        </a>
        {item.tags && item.tags.length > 0 && (
          <div className="tags-container">
            {item.tags.map((tag) => (
              <Tag color="cyan" key={tag}>
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </Card>
      <Space>
        <Button type="primary" onClick={onDelete}>
          删除
        </Button>
      </Space>
    </>
  );
};

const CategoryNotes = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [notes, setNotes] = useState([]);
  const { Content } = Layout;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  const fetchNotesByCategory = async () => {
    try {
      const fetchedNotes = await getNotesByCategory(user.id, categoryId, 0);
      console.log('Fetched fetchedNotes:', fetchedNotes.data);
      setNotes(fetchedNotes.data);
    } catch (error) {
      console.error('Failed to fetch notes by category:', error);
      message.error('获取笔记失败'); // 使用 message 组件提示
    }
  };

  useEffect(() => {
    fetchNotesByCategory();
  }, [categoryId, user]); // 添加 user 到依赖数组

  if (!notes) return <div>Loading...</div>;

  useEffect(() => {
    if (selectedNote) {
      console.log('Selected Note has been updated:', selectedNote);
    }
  }, [selectedNote]);

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
            <NoteItem
              item={item}
              onDelete={() => {
                setModalVisible(true);
                setSelectedNoteId(item.id);
                setSelectedNote(item);
              }}
            />
          )}
        />
        <Modal
          title="确认删除"
          open={modalVisible}
          onOk={async () => {
            try {
              const {
                id,
                user_id,
                title,
                content,
                word_count,
                category_id,
                tags,
                is_public,
              } = selectedNote;
              const deletedAt = new Date().toISOString();
              const dataToSend = {
                userId: user_id,
                title,
                content,
                wordCount: word_count,
                categoryId: category_id,
                tags,
                isPublic: is_public,
                isDelete: 1,
                deletedAt,
              };
              console.log('即将发送给后端的数据:', dataToSend);
              await updateNote(id, dataToSend);
              message.success('笔记已放到回收站,保留30天');
              // 直接从当前 notes 中移除已删除的笔记
              setNotes(notes.filter((note) => note.id !== selectedNoteId));
            } catch (error) {
              // 更详细的错误处理
              const errorMessage =
                error.response && error.response.data
                  ? error.response.data.message
                  : '删除笔记时发生未知错误';
              console.error('Failed to delete note: ', error);
              message.error(errorMessage);
            } finally {
              setModalVisible(false);
              setSelectedNoteId(null);
              setSelectedNote(null);
            }
          }}
          onCancel={() => {
            setModalVisible(false);
            setSelectedNoteId(null);
            setSelectedNote(null);
          }}
        >
          <p>确定将这条笔记放入回收站吗？ 此操作可在回收站中找回，保留30天。</p>
        </Modal>
      </Content>
    </Layout>
  );
};

export default CategoryNotes;
