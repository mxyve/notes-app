import React, { useState, useEffect } from 'react';
import {
  Tag,
  Layout,
  Anchor,
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
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
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
import {
  createComment,
  deleteComment,
  updateCommentLike,
} from '@/api/commentApi';
import useBrowseHistoryStore from '@/store/userBrowseHistoryStore';
import NoteWordCount from '@/components/NoteWordCount';

const communityNote = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const { Content, Sider } = Layout;
  const [comments, setComments] = useState([]);
  const [userInfoMap, setUserInfoMap] = useState({});
  const [commentContent, setCommentContent] = useState('');

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

  const anchorItems = catalog.map((item) => ({
    key: item.text,
    href: `#${item.text}`,
    title: item.text,
  }));

  // 获取评论列表及点赞状态
  const fetchComment = async () => {
    try {
      const fetchedComment = await getComments(id, {
        params: { userId: user?.id },
      });
      console.log('fetchedComment.data', fetchedComment.data);
      setComments(fetchedComment.data);
    } catch (error) {
      console.error('Failed to fetch comment:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComment();
    }
  }, [id]);

  // 创建评论
  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handlePublishComment = async () => {
    if (commentContent.trim() === '') {
      alert('请输入评论内容');
      return;
    }
    try {
      const fetchedCreateComment = await createComment({
        noteId: id,
        content: commentContent,
        userId: user.id,
      });
      console.log('fetchedCreateComment.data', fetchedCreateComment.data);
      setCommentContent('');
      await fetchComment();
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('发布评论失败');
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      await fetchComment();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('删除评论失败');
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const newUserInfoMap = { ...userInfoMap };
      for (const comment of comments) {
        if (comment.user_id) {
          if (!newUserInfoMap[comment.user_id]) {
            try {
              const fetchUsers = await getUser(comment.user_id);
              newUserInfoMap[comment.user_id] = fetchUsers.data;
            } catch (error) {
              console.error('Failed to fetch user:', error);
            }
          }
        }
      }
      setUserInfoMap(newUserInfoMap);
    };
    if (comments.length > 0) {
      fetchUserInfo();
    }
  }, [comments]);

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
      console.error('Failed to update like:', error);
    }
  };

  // 处理点赞/取消点赞
  const handleLikeComment = async (commentId) => {
    try {
      const response = await updateCommentLike(commentId, user.id, id);
      // 使用后端返回的最新点赞数和点赞状态更新本地状态
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                star_count: response.data.star_count,
                is_liked: response.data.is_liked,
              }
            : comment,
        ),
      );
    } catch (error) {
      console.error('Failed to update like:', error);
      alert(error.response?.data?.error || error.message || '操作失败');
    }
  };

  if (!note) return <div>Loading...</div>;

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Layout>
        <Content className="p-6 md:p-8 lg:p-10 flex-1 overflow-y-auto">
          <Card className="mb-6 shadow-sm">
            <Title level={2} className="mb-0">
              {note.title}
            </Title>

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
          <Card className="mb-6 shadow-sm">
            <MdPreview
              modelValue={note.content}
              onGetCatalog={onGetCatalog}
              className="prose max-w-none"
            />
            <NoteWordCount content={note.content} />
          </Card>

          {/* 评论区域 */}
          <Card
            title={
              <>
                <MessageOutlined /> 评论 ({comments.length})
              </>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <TextArea
                rows={4}
                showCount
                allowClear
                maxLength={500}
                onChange={handleCommentChange}
                placeholder="写下你的评论..."
                value={commentContent}
                className="mb-4"
              />
              {/* 如果有评论，才可以点击按钮 */}
              <Button
                type="primary"
                onClick={handlePublishComment}
                disabled={!commentContent.trim()}
              >
                发布评论
              </Button>
              <Divider className="my-4" />

              <div className="space-y-6">
                {comments.map((comment) => {
                  const userInfo = userInfoMap[comment.user_id];
                  const avatarSrc = userInfo?.avatar_url?.trim() || null;

                  return (
                    <div key={comment.id} className="flex space-x-4">
                      <Avatar
                        src={avatarSrc}
                        icon={!avatarSrc && <UserOutlined />}
                        className="flex-shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <Text strong>
                              {userInfo?.nickname ||
                                userInfo?.username ||
                                '匿名用户'}
                            </Text>
                            <Text type="secondary" className="ml-2 text-xs">
                              {new Date(comment.time).toLocaleString()}
                            </Text>
                          </div>

                          {user.id === comment.user_id && (
                            <Popconfirm
                              title="确定要删除这条评论吗？"
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: 'red' }}
                                />
                              }
                              onConfirm={() => handleDeleteComment(comment.id)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                size="small"
                                className="text-gray-400 hover:text-gray-600"
                              />
                            </Popconfirm>
                          )}
                        </div>

                        <div className="mt-2 mb-3">
                          <Text>{comment.content}</Text>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Tooltip title="点赞">
                            <Button
                              type="text"
                              icon={<LikeOutlined />}
                              onClick={() => handleLikeComment(comment.id)}
                              className={`flex items-center ${comment.is_liked ? 'text-blue-500' : 'text-gray-400'}`}
                            />
                          </Tooltip>
                          <Text type="secondary">{comment.star_count}</Text>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </Content>

        {catalog.length > 0 && (
          <Sider
            width={280}
            collapsedWidth={0}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            className="bg-white border-l shadow-sm"
            style={{
              height: 'calc(100vh - 64px)',
              position: 'sticky',
              top: '64px',
            }}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <Title level={4} className="mb-0">
                  目录
                </Title>
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-gray-500"
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                <Anchor items={anchorItems} className="text-sm" affix={false} />
              </div>
            </div>
            {collapsed && (
              <Button
                type="text"
                icon={<MenuUnfoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="fixed top-4 right-6 z-10 bg-white p-2 rounded-md shadow-md"
              />
            )}
          </Sider>
        )}
      </Layout>
    </Layout>
  );
};

export default communityNote;
