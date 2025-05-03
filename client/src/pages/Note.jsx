import React, { useState, useEffect } from 'react';
import { Tag, Layout, Anchor, Button, Avatar, Input, Popconfirm } from 'antd';
const { TextArea } = Input;
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LikeOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { getNote } from '@/api/noteApi';
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

const Note = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const { Content, Sider } = Layout;
  const [noteId, setNoteId] = useState();
  const [comments, setComments] = useState([]);
  const [userInfoMap, setUserInfoMap] = useState({});
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  // 获取笔记内容
  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        const fetchedNote = await getNote(id);
        setNote(fetchedNote.data);
        console.log('fetchedNote', fetchedNote.data);
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
      console.log('comments', comments);
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
    <Layout>
      <Navbar />
      <Layout>
        <Content className="p-8 flex-1 h-[100vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl">{note.title}</h1>
            {catalog.length > 0 && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="md:hidden"
              />
            )}
          </div>
          <div className="mb-4">
            {note.tags.map((tag) => (
              <Tag color="cyan" key={tag}>
                {tag}
              </Tag>
            ))}
          </div>
          <div className="mt-4">
            <MdPreview modelValue={note.content} onGetCatalog={onGetCatalog} />
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-bold">评论内容</h2>
            <TextArea
              showCount
              allowClear
              maxLength={200}
              onChange={handleCommentChange}
              placeholder="请输入评论内容"
              value={commentContent}
            />
            <Button
              type="primary"
              onClick={handlePublishComment}
              className="mt-2"
            >
              发布评论
            </Button>
            {comments.length > 0 && (
              <div className="mt-4">
                {comments.map((comment) => {
                  const userInfo = userInfoMap[comment.user_id];
                  const avatarSrc =
                    userInfo &&
                    userInfo.avatar_url &&
                    userInfo.avatar_url.trim() !== ''
                      ? userInfo.avatar_url
                      : null;
                  // 直接使用 comment.is_liked 控制颜色
                  return (
                    <div key={comment.id} className="border p-4 mb-4">
                      <Avatar
                        src={avatarSrc}
                        icon={!avatarSrc ? <UserOutlined /> : null}
                      />
                      <span>
                        {userInfo?.nickname || userInfo?.username || '未知用户'}
                      </span>
                      <p>{comment.content}</p>
                      <div>
                        {comment.time && (
                          <span className="text-sm text-gray-500">
                            {new Date(comment.time).toLocaleString()}
                          </span>
                        )}
                        <Button
                          type="text"
                          icon={<LikeOutlined />}
                          onClick={() => handleLikeComment(comment.id)}
                          style={{
                            color: comment.is_liked ? '#1890ff' : undefined,
                          }}
                        />
                        {comment.star_count}
                        {user.id === comment.user_id && (
                          <Popconfirm
                            title="确认删除吗？"
                            icon={
                              <QuestionCircleOutlined
                                style={{ color: 'red' }}
                              />
                            }
                            onConfirm={() => handleDeleteComment(comment.id)}
                          >
                            <Button type="link" icon={<DeleteOutlined />} />
                          </Popconfirm>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Content>

        {catalog.length > 0 && (
          <Sider
            width={250}
            collapsedWidth={0}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            className="bg-white border-l"
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'sticky',
              top: 0,
              right: 0,
            }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">目录</h3>
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                />
              </div>
              <Anchor items={anchorItems} />
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

export default Note;
