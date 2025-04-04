import { Layout, Typography } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import Sousuo from '@/components/Search';
// Layout 用于构建页面的整体布局，Typography 用于处理文本排版。
const { Content } = Layout;
const { Title } = Typography;

const Home = () => {
  const { user } = useStore();

  return (
    <Layout>
      <Navbar />
      <Content className="p-6">
        {user ? (
          <Title level={2}>欢迎， {user.nickname || user.username}</Title>
        ) : (
          <Title level={2}>欢迎来到笔记应用</Title>
        )}
        <p>这是主页。</p>
      </Content>
      <Sousuo />
    </Layout>
  );
};

export default Home;
