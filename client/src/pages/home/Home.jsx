import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  List,
} from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import {
  LikeOutlined,
  StarOutlined,
  MessageOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import './Home.css'; // 假设我们有一个CSS文件用于额外样式
import { useLikeNotesCount } from '@/hooks/useLikeNotesCount';
import { useCollectNotesCount } from '@/hooks/useCollectNotesCount';
import { useCommentNotesCount } from '@/hooks/useCommentNotesCount';
import MyBrowseHistory from '@/pages/home/MyBrowseHistory';
import { useNoteWordCount } from '@/hooks/useNoteWordCount';
import { useLikeCount } from '@/hooks/useLikeCount';
import { useCollectCount } from '@/hooks/useCollectCount';

const { Content } = Layout;
const { Title, Text } = Typography;

const friends = [
  {
    id: 1,
    name: '张三',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 2,
    name: '李四',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 3,
    name: '王五',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 4,
    name: '赵六',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
  },
];

const Home = () => {
  const { user } = useStore();
  const likeNotesCount = useLikeNotesCount(); // 获取实际点赞数量
  const collecNotesCount = useCollectNotesCount();
  const commentNotesCount = useCommentNotesCount();
  const noteWordCount = useNoteWordCount();
  const likeCount = useLikeCount();
  const collectCount = useCollectCount();

  return (
    <Layout className="personal-layout">
      <Navbar />
      <Content className="personal-content">
        {/* 用户欢迎区域 */}
        {/* <div className="welcome-section">
          {user ? (
            <>
              <Avatar
                size={64}
                src={
                  user.avatar || 'https://randomuser.me/api/portraits/men/5.jpg'
                }
              />
              <Title level={2} className="welcome-title">
                欢迎回来，{user.nickname || user.username}！
              </Title>
              <Text type="secondary">今天也是充满灵感的一天</Text>
            </>
          ) : (
            <Title level={2}>欢迎来到笔记应用</Title>
          )}
        </div> */}
        {/* 数据概览卡片 */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <a href={`/home/like-note/${user.id}`}>
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
            <a href={`/home/collect-note/${user.id}`}>
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
            <a href={`/home/comment-note/${user.id}`}>
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
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card className="stat-card">
              <Statistic
                title="收藏数"
                value={collectCount}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
        </Row>
        {/* 最近浏览和好友列表 */}
        <Row gutter={[16, 16]} className="bottom-section">
          <Col xs={24} md={12}>
            {/* <Card
              title={
                <span>
                  <EyeOutlined /> 最近浏览
                </span>
              }
              className="list-card"
            > */}
            <MyBrowseHistory />
            {/* <List
                itemLayout="horizontal"
                dataSource={recentViews}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<a href="#">{item.title}</a>}
                      description={`浏览时间: ${item.time}`}
                    />
                  </List.Item>
                )}
              /> */}
            {/* </Card> */}
          </Col>
          <Col xs={24} md={12}>
            <Card
              title={
                <span>
                  <TeamOutlined /> 我的好友
                </span>
              }
              className="list-card"
            >
              <List
                grid={{ gutter: 16, xs: 2, sm: 3, md: 3, lg: 4, xl: 4 }}
                dataSource={friends}
                renderItem={(item) => (
                  <List.Item>
                    <div className="friend-item">
                      <Avatar src={item.avatar} size="large" />
                      <Text className="friend-name">{item.name}</Text>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Home;
