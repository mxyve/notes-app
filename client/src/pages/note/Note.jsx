import { useState, useEffect, useRef, forwardRef } from 'react';
import {
  Tag,
  Layout,
  Button,
  Avatar,
  Card,
  Space,
  Typography,
  FloatButton,
} from 'antd';
const { Text, Title } = Typography;
const { Content } = Layout;
import {
  UserOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  StarOutlined,
  CommentOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { getNote, updateNoteLike, updateNoteCollection } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import { MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import useBrowseHistoryStore from '@/store/userBrowseHistoryStore';
import NoteWordCount from '@/components/NoteWordCount';
import Export from './noteComponents/Export';
import Catalog from './noteComponents/Catalog';
import Comments from './noteComponents/Comments';
import GlobalModals from '@/components/GlobalModals';

// 修改 Comments 组件引用方式，使用 forwardRef
const CommentsWithRef = forwardRef((props, ref) => {
  return (
    <div ref={ref}>
      <Comments {...props} />
    </div>
  );
});

const Note = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [comments, setComments] = useState([]);

  const { addToHistory } = useBrowseHistoryStore(user?.id);
  const commentsRef = useRef(null);

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

          {/* 评论区域，添加了 id 属性 */}
          <CommentsWithRef
            ref={commentsRef}
            noteId={id}
            user={user}
            comments={comments}
            setComments={setComments}
            id="comments-section"
          />
        </Content>
        {/* 侧边栏目录 */}
        {catalog.length > 0 && <Catalog catalog={catalog} />}
      </Layout>
      <GlobalModals />

      <FloatButton.Group shape="circle" style={{ right: 24, bottom: 100 }}>
        {/* 置顶按钮 */}
        <FloatButton
          icon={<VerticalAlignTopOutlined />}
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        />

        {/* 评论按钮 */}
        <FloatButton
          icon={<CommentOutlined />}
          type="primary"
          onClick={() => {
            if (commentsRef.current) {
              const element = commentsRef.current;
              const offset = 80;
              const bodyRect = document.body.getBoundingClientRect().top;
              const elementRect = element.getBoundingClientRect().top;
              const elementPosition = elementRect - bodyRect;
              const offsetPosition = elementPosition - offset;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
              });
            }
          }}
        />
      </FloatButton.Group>
    </Layout>
  );
};

export default Note;
