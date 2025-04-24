import { Layout, Input, Button, Spin } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { chat } from '@/api/aiApi';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const AiChat = () => {
  // const { user } = useStore();
  const { Content } = Layout;
  const [systemContent, setSystemContent] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); //阻止表单提交和页面刷新
    setIsLoading(true);
    try {
      const responseData = await chat(systemContent, userMessage);
      setResponse(responseData);
    } catch (error) {
      console.error('请求出错：', error);
      setResponse('请求出错，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Input
          placeholder="请输入前提内容"
          value={systemContent}
          onChange={(e) => setSystemContent(e.target.value)}
        />
        <Input
          placeholder="请输入"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        />
        <Button onClick={handleSubmit}>提交</Button>
        {isLoading && <Spin />}
        <ReactMarkdown>{response}</ReactMarkdown>
      </Content>
    </Layout>
  );
};
export default AiChat;
