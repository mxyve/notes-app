import React, { useState, useEffect } from 'react';
import {
  Tag,
  Layout,
  Button,
  Avatar,
  Input,
  Popconfirm,
  Card,
  Space,
  Typography,
  Divider,
  Tooltip,
} from 'antd';
const { TextArea } = Input;
const { Text, Title } = Typography;
const { Header, Content, Footer, Sider } = Layout;
import {
  UserOutlined,
  LikeOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  StarOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { getNote, updateNoteLike, updateNoteCollection } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { getComments } from '@/api/commentApi';
import { getUser } from '@/api/userApi';
import useBrowseHistoryStore from '@/store/userBrowseHistoryStore';
import NoteWordCount from '@/components/NoteWordCount';
import Export from './Export';
import Catalog from './Catalog';
import Comments from './Comments';

const Note = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [comments, setComments] = useState([]);

  const { browseHistory, addToHistory } = useBrowseHistoryStore(user?.id);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  // 获取笔记内容
  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        const fetchedNote = await getNote(id, {
          params: { userId: user?.id },
        });
        setNote(fetchedNote.data);
        console.log('fetchedNote', fetchedNote.data);
        // 添加当前笔记到浏览记录
        if (fetchedNote.data) {
          addToHistory(fetchedNote.data.id, fetchedNote.data.title, user?.id);
        }
      } catch (error) {
        console.error('Failed to fetch note details:', error);
        alert('获取笔记详情失败');
        navigate('/categories');
      }
    };
    fetchNoteDetails();
  }, [id, navigate]);

  const onGetCatalog = (list) => {
    setCatalog(list);
  };

  // 笔记点赞
  const handleLikeNote = async (id) => {
    try {
      const response = await updateNoteLike(id, user.id);
      console.log('response', response.data);
      // 更新本地 note 状态
      if (note) {
        setNote({
          ...note,
          like_count: response.data.like_count,
          is_liked: response.data.is_liked,
        });
      }
    } catch (error) {
      console.error('Failed to update like:', error);
    }
  };

  // 笔记收藏
  const handleCollectNote = async (id) => {
    try {
      const response = await updateNoteCollection(id, user.id);
      console.log('response12121212', response.data);
      // 更新本地note状态
      if (note) {
        setNote({
          ...note,
          collection_count: response.data.collection_count,
          is_collect: response.data.is_collect,
        });
      }
    } catch (error) {
      console.error('Failed to update collection:', error);
    }
  };

  if (!note) return <div>Loading...</div>;

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Layout>
        {/* 主内容区 */}
        <Content className="flex-1 overflow-y-auto p-4">
          <Card className="mb-6 shadow-sm">
            <Title level={2} className="mb-0">
              {note.title}
            </Title>
            <a href={`/community/PersonalPage/${note.user_id}`}>
              <Avatar
                src={note.avatar_url || null}
                icon={!note.avatar_url && <UserOutlined />}
                size={32}
              />
            </a>
            {note.nickname ? note.nickname : note.username}

            <div className="flex items-center space-x-4 text-gray-500">
              <Export
                note={note}
                isExportingMd={false}
                setIsExportingMd={() => {}}
              />
            </div>

            <div className="flex items-center space-x-4 text-gray-500">
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">
                  {new Date(note.created_at).toLocaleString()}
                </Text>
              </Space>
              <Space>
                <Button
                  icon={<HeartOutlined />}
                  type="text"
                  onClick={() => handleLikeNote(note.id)}
                  style={{
                    color: note.is_liked ? '#1890ff' : undefined,
                  }}
                >
                  {note.like_count}
                </Button>
              </Space>
              <Space>
                <Button
                  icon={<StarOutlined />}
                  type="secondary"
                  onClick={() => handleCollectNote(note.id)}
                  style={{
                    color: note.is_collect ? '#1890ff' : undefined,
                  }}
                >
                  {note.collection_count}
                </Button>
              </Space>
            </div>

            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Tag color="cyan" key={tag} className="m-2">
                  {tag}
                </Tag>
              ))}
            </div>
          </Card>

          {/* 笔记内容 */}
          <Card className="mb-6 shadow-sm" id="markdown-content">
            <MdPreview
              modelValue={note.content}
              onGetCatalog={onGetCatalog}
              className="prose max-w-none"
            />
            <div className="flex justify-end mt-2">
              <NoteWordCount content={note.content} />
            </div>
          </Card>

          {/* 评论区域 */}
          <Comments
            noteId={id}
            user={user}
            comments={comments}
            setComments={setComments}
          />
        </Content>
        {/* 侧边栏目录 */}
        {catalog.length > 0 && <Catalog catalog={catalog} />}
      </Layout>
    </Layout>
  );
};

export default Note;
