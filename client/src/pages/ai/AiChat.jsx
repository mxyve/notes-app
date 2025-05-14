import { Layout, Input, Button, Spin } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { chat } from '@/api/aiApi';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import DraggableModal from './DraggableModal'; // 导入可拖拽模态框组件

const AiChat = () => {
  const { Content } = Layout;
  const [systemContent, setSystemContent] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制模态框显示状态

  const handleSubmit = async () => {
    if (!userMessage.trim()) return; // 避免空消息提交

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

  const showChatModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    // 可选：重置表单
    // setSystemContent('');
    // setUserMessage('');
    // setResponse('');
  };

  return (
    <Layout>
      <Navbar showChatModal={showChatModal} />
      <Content
        style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          backgroundColor: 'white',
        }}
      >
        <DraggableModal
          title="AI聊天助手"
          open={isModalVisible}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
          loading={isLoading}
          width={700}
          submitText="发送消息"
        >
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              placeholder="请输入前提内容（可选）"
              value={systemContent}
              onChange={(e) => setSystemContent(e.target.value)}
              rows={2}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              placeholder="请输入您的问题..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              rows={4}
              onPressEnter={handleSubmit} // 支持按Enter提交
            />
          </div>

          {/* 显示AI回复 */}
          {response && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                backgroundColor: '#f9fafb',
              }}
            >
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}
        </DraggableModal>
      </Content>
    </Layout>
  );
};

export default AiChat;
