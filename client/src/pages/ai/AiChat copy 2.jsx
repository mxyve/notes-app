// 用了对话框，未封装版
import { Layout, Input, Button, Spin, Modal } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { chat } from '@/api/aiApi';
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import Draggable from 'react-draggable';

const AiChat = () => {
  const { Content } = Layout;
  const [systemContent, setSystemContent] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef(null);
  const [disabled, setDisabled] = useState(true); // 新增disabled状态

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSystemContent('');
    setUserMessage('');
    setResponse('');
  };

  const onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
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
        <Button type="primary" onClick={showModal}>
          打开AI聊天对话框
        </Button>

        <Modal
          title={
            <div
              style={{
                width: '100%',
                cursor: 'move',
              }}
              onMouseOver={() => {
                if (disabled) {
                  setDisabled(false);
                }
              }}
              onMouseOut={() => {
                setDisabled(true);
              }}
              // 防止拖拽时选中文本
              onMouseDown={(e) => e.preventDefault()}
            >
              AI聊天 (可拖拽)
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleSubmit}
              loading={isLoading}
            >
              提交
            </Button>,
          ]}
          width={800}
          modalRender={(modal) => (
            <Draggable
              disabled={disabled}
              bounds={bounds}
              onStart={onStart}
              nodeRef={draggleRef}
            >
              <div ref={draggleRef}>{modal}</div>
            </Draggable>
          )}
        >
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              placeholder="请输入前提内容（系统角色设定）"
              value={systemContent}
              onChange={(e) => setSystemContent(e.target.value)}
              rows={2}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input.TextArea
              placeholder="请输入您的问题或消息"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              rows={4}
            />
          </div>

          {isLoading && (
            <Spin style={{ display: 'block', margin: '20px auto' }} />
          )}

          {response && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                backgroundColor: '#fafafa',
              }}
            >
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default AiChat;
