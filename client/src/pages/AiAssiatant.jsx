import { Layout, Typography } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
// Layout 用于构建页面的整体布局，Typography 用于处理文本排版。
const { Content } = Layout;
const { Title } = Typography;

const Home = () => {
  const { user } = useStore();
  return (
    <Layout>
      <Navbar />
      <Content
        style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          backgroundColor: 'white',
        }}
      >
        <p>AI智能</p>
      </Content>
    </Layout>
  );
};
export default Home;
