import {
  Layout,
  List,
  Typography,
  Tag,
  Divider,
  Modal,
  Button,
  message,
} from 'antd';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { getNotes, deleteNote, updateNote } from '@/api/noteApi';
import dayjs from 'dayjs';
import GlobalModals from '@/components/GlobalModals';

const { Content } = Layout;
const { Text, Title } = Typography;

const RecycleBin = () => {
  const { user } = useStore();
  const [notesList, setNotesList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNoteData = async () => {
    try {
      const getNotesData = await getNotes(user.id, 1);
      const sortedNotes = getNotesData.data.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at),
      );

      const filteredNotes = sortedNotes.filter(async (note) => {
        const deltedDate = dayjs(note.deleted_at);
        const today = dayjs();
        const diff = today.diff(deltedDate, 'day'); //（以天为单位）
        if (diff > 30) {
          try {
            await deleteNote(note.id);
            message.success('超过30天的笔记已自动删除');
            return false;
          } catch (error) {
            message.error('自动删除笔记时发生错误');
            return true;
          }
        }
        return true;
      });

      const finalNotes = await Promise.all(filteredNotes);
      setNotesList(finalNotes.filter(Boolean));
    } catch (error) {
      console.error('Error fetching notes:', error);
      message.error('获取笔记失败');
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;

    setLoading(true);
    try {
      await deleteNote(selectedNote.id);
      message.success('笔记删除成功');
      await fetchNoteData(); // 重新获取数据确保一致性
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || '删除笔记时发生未知错误';
      message.error(errorMessage);
    } finally {
      setLoading(false);
      setModalVisible(false);
      setSelectedNote(null);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNoteData();
    }
  }, [user?.id]);

  // 恢复-更新 is_delete 值为 0
  const handleRestore = async (note) => {
    try {
      const dataToSend = {
        userId: note.user_id,
        title: note.title,
        content: note.content,
        wordCount: note.word_count,
        categoryId: note.category_id,
        tags: note.tags,
        isPublic: note.is_public,
        isDelete: 0, // 设置为0表示恢复
      };

      await updateNote(note.id, dataToSend);
      message.success('笔记恢复成功');
      await fetchNoteData();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || '恢复笔记时发生错误';
      message.error(errorMessage);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNoteData();
    }
  }, [user?.id]);

  return (
    <Layout className="personal-layout">
      <Navbar />
      <Content className="personal-content">
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2}>笔记回收站</Title>
          <List
            itemLayout="vertical"
            dataSource={notesList}
            renderItem={(note) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <Title level={4} style={{ marginBottom: 4 }}>
                    {note.title}
                  </Title>
                  <Text
                    type="secondary"
                    style={{ display: 'block', marginBottom: 8 }}
                  >
                    {dayjs(note.updated_at).format('YYYY-MM-DD')}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ display: 'block', marginBottom: 8 }}
                  >
                    删除日期: {dayjs(note.deleted_at).format('YYYY-MM-DD')}
                  </Text>
                  <Text className="line-clamp-3" style={{ marginBottom: 12 }}>
                    {note.content}
                  </Text>
                  <div style={{ marginBottom: 12 }}>
                    {note.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <Text type="secondary" style={{ marginRight: 16 }}>
                        {note.word_count} 字
                      </Text>
                    </div>
                    <Button
                      onClick={() => handleRestore(note)}
                      style={{ marginRight: 8 }}
                    >
                      恢复
                    </Button>
                    <Button
                      type="primary"
                      danger
                      onClick={() => {
                        setModalVisible(true);
                        setSelectedNote(note);
                      }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
                <Divider />
              </List.Item>
            )}
          />

          {/* 将Modal移到列表外部 */}
          <Modal
            title="确认删除"
            open={modalVisible}
            onOk={handleDelete}
            onCancel={() => {
              setModalVisible(false);
              setSelectedNote(null);
            }}
            confirmLoading={loading}
          >
            <p>确定将这条笔记永久删除吗？此操作不可撤销。</p>
          </Modal>
        </div>
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default RecycleBin;
