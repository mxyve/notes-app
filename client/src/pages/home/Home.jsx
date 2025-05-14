import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  List,
  message,
} from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { useState, useEffect } from 'react';
import {
  LikeOutlined,
  StarOutlined,
  MessageOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './Home.css';
import { useLikeNotesCount } from '@/hooks/useLikeNotesCount';
import { useCollectNotesCount } from '@/hooks/useCollectNotesCount';
import { useCommentNotesCount } from '@/hooks/useCommentNotesCount';
import MyBrowseHistory from '@/pages/home/MyBrowseHistory';
import { useNoteWordCount } from '@/hooks/useNoteWordCount';
import { useLikeCount } from '@/hooks/useLikeCount2';
import { useCollectCount } from '@/hooks/useCollectCount2';
import { getFollows, getUserFollowers } from '@/api/communityApi';
import GlobalModals from '@/components/GlobalModals';

const { Content } = Layout;
const { Text } = Typography;

const Home = ({ children }) => {
  const { user } = useStore();
  const likeNotesCount = useLikeNotesCount();
  const collecNotesCount = useCollectNotesCount();
  const commentNotesCount = useCommentNotesCount();
  const noteWordCount = useNoteWordCount();
  const likeCount = useLikeCount();
  const collectCount = useCollectCount();

  // 好友列表状态
  const [followsData, setFollowsData] = useState([]);
  const [userfollowersData, setUserfollowersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取好友列表数据
  useEffect(() => {
    const fetchFollowsData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getFollows(user.id);
        setFollowsData(response.data || []);
      } catch (err) {
        console.error('获取好友列表失败:', err);
        setError('获取好友列表失败，请稍后重试');
        message.error('获取好友列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowsData();
  }, [user?.id]);

  useEffect(() => {
    const fetchUserFollowersData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getUserFollowers(user.id);
        setUserfollowersData(response.data || []);
      } catch (err) {
        console.error('获取好友列表失败:', err);
        setError('获取好友列表失败，请稍后重试');
        message.error('获取好友列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchUserFollowersData();
  }, [user?.id]);

  return (
    <Layout className="personal-layout">
      <Navbar />
      <Content className="personal-content">
        {/* 统计卡片行 */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <a href={`/home/like-note/${user?.id}`}>
              <Card className="stat-card">
                <Statistic
                  title="我的点赞"
                  value={likeNotesCount}
                  prefix={<LikeOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </a>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <a href={`/home/collect-note/${user?.id}`}>
              <Card className="stat-card">
                <Statistic
                  title="我的收藏"
                  value={collecNotesCount}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </a>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <a href={`/home/comment-note/${user?.id}`}>
              <Card className="stat-card">
                <Statistic
                  title="我的评论"
                  value={commentNotesCount}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </a>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="stat-card">
              <Statistic
                title="创作总字数"
                value={noteWordCount}
                prefix={<FileTextOutlined />}
                suffix="字"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="stat-card">
              <Statistic
                title="获赞数"
                value={likeCount}
                prefix={<LikeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="stat-card">
              <Statistic
                title="收藏数"
                value={collectCount}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 最近浏览和好友列表 */}
        <Row gutter={[16, 16]} className="bottom-section">
          <Col xs={24} md={12}>
            <MyBrowseHistory />
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <span>
                  <TeamOutlined /> 我的好友
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {followsData.length}人
                  </Text>
                </span>
              }
              className="list-card"
              loading={loading}
            >
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                <List
                  grid={{ gutter: 16, xs: 2, sm: 3, md: 3, lg: 4, xl: 4 }}
                  dataSource={followsData}
                  renderItem={(user) => (
                    <List.Item>
                      <a
                        href={`/community/PersonalPage/${user.id}`}
                        className="friend-item"
                        title={user.signature || '暂无个性签名'}
                      >
                        <Avatar
                          src={user.avatar_url}
                          size="large"
                          icon={<UserOutlined />}
                          className="friend-avatar"
                        />
                        <Text className="friend-name" ellipsis>
                          {user.nickname || user.username}
                        </Text>
                      </a>
                    </List.Item>
                  )}
                  locale={{
                    emptyText: '暂无好友，快去关注一些用户吧！',
                  }}
                />
              )}
            </Card>
            <Card
              title={
                <span>
                  <TeamOutlined /> 我的粉丝
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {userfollowersData.length}人
                  </Text>
                </span>
              }
              className="list-card"
              loading={loading}
            >
              {error ? (
                <div className="error-message">{error}</div>
              ) : (
                <List
                  grid={{ gutter: 16, xs: 2, sm: 3, md: 3, lg: 4, xl: 4 }}
                  dataSource={userfollowersData}
                  renderItem={(user) => (
                    <List.Item>
                      <a
                        href={`/community/PersonalPage/${user.id}`}
                        className="friend-item"
                        title={user.signature || '暂无个性签名'}
                      >
                        <Avatar
                          src={user.avatar_url}
                          size="large"
                          icon={<UserOutlined />}
                          className="friend-avatar"
                        />
                        <Text className="friend-name" ellipsis>
                          {user.nickname || user.username}
                        </Text>
                      </a>
                    </List.Item>
                  )}
                  locale={{
                    emptyText: '暂无好友，快去关注一些用户吧！',
                  }}
                />
              )}
            </Card>
          </Col>
        </Row>
        {children}
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default Home;
