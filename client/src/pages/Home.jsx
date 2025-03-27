import { Layout, Typography } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';

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
    </Layout>
  );
};

export default Home;
