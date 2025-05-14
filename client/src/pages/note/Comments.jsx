import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Popconfirm,
  Tooltip,
  Input,
  Space,
  Divider,
  Avatar,
  Typography,
  Pagination,
  Spin,
  message,
  Collapse,
} from 'antd';
const { TextArea } = Input;
const { Text } = Typography;
const { Panel } = Collapse;
import {
  LikeOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  UserOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import {
  updateCommentLike,
  createComment,
  getComments,
  deleteComment,
} from '@/api/commentApi';

const Comments = ({ noteId, user }) => {
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});

  // 获取评论列表
  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getComments(noteId, {
        params: {
          userId: user?.id,
          page,
          pageSize: 10,
        },
      });

      setComments(response.data.data.comments || []);
      setTotalComments(response.data.data.pagination?.total || 0);
      setCurrentPage(response.data.data.pagination?.page || 1);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('获取评论失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (noteId) {
      fetchComments();
    }
  }, [noteId]);

  // 监听页码变化，重新加载评论
  useEffect(() => {
    if (noteId && currentPage > 0) {
      fetchComments(currentPage);
    }
  }, [noteId, currentPage]);

  // 创建评论
  const handleCommentChange = (e) => {
    setCommentContent(e.target.value);
  };

  const handlePublishComment = async () => {
    if (!commentContent.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    try {
      await createComment({
        noteId,
        content: commentContent,
        userId: user.id,
        replyId: 0,
      });
      setCommentContent('');
      fetchComments(currentPage);
    } catch (error) {
      console.error('Failed to create comment:', error);
      message.error('发布评论失败');
    }
  };

  // 创建回复
  const handleReplyChange = (e, commentId) => {
    setReplyContent((prev) => ({
      ...prev,
      [commentId]: e.target.value,
    }));
  };

  const handlePublishReply = async (commentId) => {
    const content = replyContent[commentId] || '';
    if (!content.trim()) {
      message.warning('请输入回复内容');
      return;
    }
    try {
      await createComment({
        noteId,
        content,
        userId: user.id,
        replyId: commentId,
      });
      setReplyContent((prev) => {
        const newContents = { ...prev };
        delete newContents[commentId];
        return newContents;
      });
      setReplyingTo(null);
      fetchComments(currentPage);
    } catch (error) {
      console.error('Failed to create reply:', error);
      message.error('发布回复失败');
    }
  };

  // 删除评论/回复
  const handleDelete = async (id) => {
    try {
      await deleteComment(id);
      message.success('删除成功');
      fetchComments(currentPage);
    } catch (error) {
      console.error('Failed to delete:', error);
      message.error('删除失败');
    }
  };

  // 处理点赞/取消点赞
  const handleLike = async (id) => {
    try {
      const response = await updateCommentLike(id, user.id, noteId);
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === id) {
            return {
              ...comment,
              star_count: response.data.star_count,
              is_liked: response.data.is_liked,
            };
          }
          if (comment.replies) {
            const updatedReplies = comment.replies.map((reply) => {
              if (reply.id === id) {
                return {
                  ...reply,
                  star_count: response.data.star_count,
                  is_liked: response.data.is_liked,
                };
              }
              return reply;
            });
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        }),
      );
    } catch (error) {
      console.error('Failed to update like:', error);
      message.error('操作失败');
    }
  };

  // 查找被回复的评论内容
  const findOriginalComment = (commentId, commentsList) => {
    const flattenComments = (comments) => {
      let all = [];
      comments.forEach((comment) => {
        all.push(comment);
        if (comment.replies) {
          all = all.concat(flattenComments(comment.replies));
        }
      });
      return all;
    };

    const allComments = flattenComments(commentsList);
    const original = allComments.find((c) => c.id === commentId);

    return original
      ? {
          content: original.content,
          displayName: original.nickname || original.username || '用户',
        }
      : null;
  };

  // 切换回复的展开/收起状态
  const toggleReplyExpansion = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 渲染评论项
  const renderComment = (comment, depth = 0) => {
    const {
      id,
      user_id,
      time,
      star_count,
      is_liked,
      username,
      nickname,
      avatar_url,
      content,
      reply_username,
      reply_nickname,
      reply_id,
      replies = [],
    } = comment;

    const displayName = nickname || username || '匿名用户';
    const repliedToName = reply_nickname || reply_username || '用户';
    const originalComment = reply_id
      ? findOriginalComment(reply_id, comments)
      : null;

    const hasReplies = replies.length > 0;
    const isExpanded = expandedReplies[id] !== false; // 默认展开

    return (
      <div
        key={id}
        className={`mb-4 ${depth > 0 ? 'pl-10 border-l-2 border-gray-200' : ''}`}
      >
        <div className="flex space-x-3">
          <Avatar
            src={avatar_url}
            icon={!avatar_url && <UserOutlined />}
            size={depth > 0 ? 28 : 40}
            className="rounded-full"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <Text strong className="text-lg">
                  {displayName}
                </Text>
                <Text type="secondary" className="ml-2 text-xs">
                  {new Date(time).toLocaleString()}
                </Text>
              </div>
              {user?.id === user_id && (
                <Popconfirm
                  title="确定要删除吗？"
                  icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                  onConfirm={() => handleDelete(id)}
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

            {/* 显示被回复的内容 */}
            {depth > 0 && originalComment && (
              <div className="mt-1 mb-1 p-2 bg-gray-50 rounded">
                <Text type="secondary">
                  回复 <Text strong>{originalComment.displayName}</Text>:{' '}
                  {originalComment.content}
                </Text>
              </div>
            )}

            <div className="mt-1 mb-2">
              <Text className="text-gray-700">{content}</Text>
            </div>

            <div className="flex items-center space-x-4">
              <Tooltip title="点赞">
                <Button
                  type="text"
                  icon={<LikeOutlined />}
                  onClick={() => handleLike(id)}
                  className={`flex items-center ${is_liked ? 'text-blue-500' : 'text-gray-400'}`}
                />
              </Tooltip>
              <Text type="secondary">{star_count}</Text>
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={() => {
                  setReplyingTo(id);
                  setReplyContent((prev) => ({ ...prev, [id]: '' }));
                }}
                size="small"
              >
                回复
              </Button>
              {hasReplies && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => toggleReplyExpansion(id)}
                  icon={
                    <CaretRightOutlined
                      style={{
                        transition: 'transform 0.3s',
                        transform: isExpanded
                          ? 'rotate(90deg)'
                          : 'rotate(0deg)',
                      }}
                    />
                  }
                >
                  {isExpanded ? '收起回复' : `查看回复 (${replies.length})`}
                </Button>
              )}
            </div>

            {replyingTo === id && (
              <div className="mt-3">
                <TextArea
                  rows={2}
                  showCount
                  maxLength={500}
                  onChange={(e) => handleReplyChange(e, id)}
                  placeholder={`回复 ${displayName}`}
                  value={replyContent[id] || ''}
                  className="mb-2 border border-gray-300 rounded"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="text"
                    onClick={() => setReplyingTo(null)}
                    size="small"
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => handlePublishReply(id)}
                    disabled={!(replyContent[id] || '').trim()}
                    size="small"
                  >
                    回复
                  </Button>
                </div>
              </div>
            )}

            {hasReplies && isExpanded && (
              <div className="mt-3">
                {replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card title={`评论 (${totalComments})`} className="shadow-md rounded">
      <div className="space-y-4 p-4">
        <TextArea
          rows={4}
          showCount
          allowClear
          maxLength={500}
          onChange={handleCommentChange}
          placeholder="写下你的评论..."
          value={commentContent}
          className="mb-4 border border-gray-300 rounded"
        />
        <Button
          type="primary"
          onClick={handlePublishComment}
          disabled={!commentContent.trim()}
          className="hover:bg-blue-600"
        >
          发布评论
        </Button>
        <Divider className="my-4" />

        {loading && (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        )}

        {!loading && comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => renderComment(comment))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-10 text-gray-500">
            暂无评论，快来发表你的看法吧
          </div>
        )}

        {totalComments > 10 && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              total={totalComments}
              pageSize={10}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className="text-gray-600"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default Comments;
