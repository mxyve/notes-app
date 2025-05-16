import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  List,
  Typography,
  Space,
  Button,
  Empty,
  Tag,
  Tooltip,
} from 'antd';
import {
  LikeOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  LikeFilled,
} from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { getMyComments } from '@/api/homeApi';
import { useStore } from '@/store/userStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import GlobalModals from '@/components/GlobalModals';

dayjs.extend(relativeTime);

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const TimeDisplay = ({ time }) => (
  <Tooltip title={dayjs(time).format('YYYY-MM-DD HH:mm')}>
    <Space>
      <ClockCircleOutlined />
      <Text type="secondary">{dayjs(time).fromNow()}</Text>
    </Space>
  </Tooltip>
);

const LikeStatus = ({ isLiked, starCount }) => (
  <Space>
    {isLiked ? <LikeFilled style={{ color: '#ff4d4f' }} /> : <LikeOutlined />}
    <Text>{starCount || 0}</Text>
  </Space>
);

const MyCommentNotes = ({ children }) => {
  const { user } = useStore();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCommentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyComments(user.id);
      console.log('response', response.data);
      setComments(response.data || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('加载评论失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentsData();
  }, [user.id]);

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <Title level={3} className="flex items-center">
            <MessageOutlined className="mr-2 text-blue-500" />
            我的评论
          </Title>
          <Text type="secondary">共 {comments.length} 条评论</Text>
        </div>

        {error ? (
          <Card>
            <Empty description={error}>
              <Button type="primary" onClick={fetchCommentsData}>
                重新加载
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <List
              itemLayout="vertical"
              loading={loading}
              dataSource={comments}
              locale={{ emptyText: '暂无评论' }}
              renderItem={(comment) => (
                <List.Item
                  key={comment.id}
                  className="hover:bg-gray-50 p-4 rounded transition-colors"
                  extra={
                    <Button
                      type="text"
                      size="small"
                      icon={<MessageOutlined />}
                      onClick={() =>
                        (window.location.href = `/notes/${comment.note_id}`)
                      }
                    >
                      查看原文
                    </Button>
                  }
                >
                  <div className="flex justify-between items-start mb-2">
                    <span style={{ color: 'blue' }}>{comment.title}</span>
                    <TimeDisplay time={comment.time} />
                  </div>
                  <Paragraph className="mb-3 text-base">
                    {comment.content}
                  </Paragraph>
                  <div className="flex justify-between items-center">
                    <LikeStatus
                      isLiked={comment.is_liked}
                      starCount={comment.star_count}
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default MyCommentNotes;
