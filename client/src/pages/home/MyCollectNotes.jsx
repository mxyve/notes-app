import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  Layout,
  Card,
  List,
  Tag,
  Typography,
  Space,
  Avatar,
  Button,
  Divider,
  Empty,
} from 'antd';
import { getCollectNote } from '@/api/homeApi';
import { useStore } from '@/store/userStore';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import {
  LikeOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  StarOutlined,
} from '@ant-design/icons';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const TimeDisplay = ({ time }) => (
  <Space>
    <ClockCircleOutlined />
    <Text type="secondary">{dayjs(time).fromNow()}</Text>
  </Space>
);

const TagsGroup = ({ tags }) => (
  <Space wrap>
    {tags.map((tag) => (
      <Tag key={tag} color="blue">
        {tag}
      </Tag>
    ))}
  </Space>
);

const NoteStats = ({ likeCount, collectCount }) => (
  <Space split={<Divider type="vertical" />}>
    <Space>
      <LikeOutlined style={{ color: '#ff4d4f' }} />
      <Text>{likeCount}</Text>
    </Space>
    <Space>
      <StarOutlined style={{ color: '#faad14' }} />
      <Text>{collectCount}</Text>
    </Space>
  </Space>
);

const MyCollectNotes = () => {
  const { user } = useStore();
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLikeNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchNotes = await getCollectNote(user.id);
      console.log('fetchNotes', fetchNotes.data);
      setNotes(fetchNotes.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setError('加载点赞笔记失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchLikeNotes();
  }, [user.id]);

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <Title level={3} className="flex items-center">
            <StarOutlined className="mr-2 text-red-500" />
            我收藏的笔记
          </Title>
          <Text type="secondary">共 {notes.length} 篇收藏笔记</Text>
        </div>

        {error ? (
          <Card>
            <Empty description={error}>
              <Button type="primary" onClick={fetchLikeNotes}>
                重新加载
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card className="shadow-sm">
            <List
              itemLayout="vertical"
              size="large"
              loading={loading}
              dataSource={notes}
              locale={{ emptyText: '暂无点赞笔记' }}
              renderItem={(note) => (
                <List.Item
                  key={note.id}
                  className="hover:bg-gray-50 p-4 rounded"
                  actions={[
                    <NoteStats
                      likeCount={note.like_count}
                      collectCount={note.collection_count}
                    />,
                    <TimeDisplay time={note.updated_at} />,
                  ]}
                  extra={
                    note.tags?.length > 0 && <TagsGroup tags={note.tags} />
                  }
                >
                  {/* 新增的用户信息展示部分 */}
                  <div className="flex items-center mb-3">
                    <img
                      src={note.avatar_url || 'https://picsum.photos/40/40'}
                      alt="用户头像"
                      className="w-8 h-8 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <Text strong>{note.nickname || note.username}</Text>
                    </div>
                  </div>

                  <List.Item.Meta
                    title={
                      <a
                        href={`/community/note/${note.id}`}
                        className="text-lg"
                      >
                        {note.title}
                      </a>
                    }
                    description={
                      <Text type="secondary">
                        {dayjs(note.created_at).format('YYYY-MM-DD')}
                      </Text>
                    }
                  />
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    className="mt-2 text-gray-600"
                  >
                    {note.content}
                  </Paragraph>
                </List.Item>
              )}
            />
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default MyCollectNotes;
