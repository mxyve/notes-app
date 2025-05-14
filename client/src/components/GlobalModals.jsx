// src/components/GlobalModals/index.jsx
import { useContext, useState } from 'react';
import { ModalContext } from '@/context/ModalContext';
import DraggableModal from '@/pages/ai/DraggableModal';
import { Input, Spin, message } from 'antd';
import ReactMarkdown from 'react-markdown';
import { chat, ocr } from '@/api/aiApi';

const GlobalModals = () => {
  // 从全局状态获取控制参数
  const {
    chatModalVisible,
    setChatModalVisible,
    ocrModalVisible,
    setOcrModalVisible,
  } = useContext(ModalContext);

  // AI 聊天相关状态
  const [systemContent, setSystemContent] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // OCR 相关状态
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrImageUrl, setOcrImageUrl] = useState('');
  const [ocrResult, setOcrResult] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // 处理 AI 聊天提交
  const handleChatSubmit = async () => {
    if (!userMessage.trim()) {
      message.warning('请输入问题内容');
      return;
    }

    setIsChatLoading(true);
    try {
      const response = await chat(systemContent, userMessage);
      setAiResponse(response);
    } catch (error) {
      message.error('AI 请求失败');
      console.error('AI 请求错误:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 处理 OCR 文件选择
  const handleOcrFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFile(file);
    setOcrImageUrl(URL.createObjectURL(file));
    setOcrResult('');
  };

  // 处理 OCR 识别
  const handleOcrSubmit = async () => {
    if (!ocrFile) {
      message.warning('请先选择图片文件');
      return;
    }

    setIsOcrLoading(true);
    try {
      const result = await ocr(ocrFile);
      setOcrResult(result);
    } catch (error) {
      message.error('OCR 识别失败');
      console.error('OCR 错误:', error);
    } finally {
      setIsOcrLoading(false);
    }
  };

  // 重置 OCR 状态
  const resetOcr = () => {
    setOcrFile(null);
    setOcrImageUrl('');
    setOcrResult('');
  };

  return (
    <>
      {/* AI 聊天对话框 */}
      <DraggableModal
        title="AI 智能助手"
        open={chatModalVisible}
        onCancel={() => {
          setChatModalVisible(false);
          setSystemContent('');
          setUserMessage('');
          setAiResponse('');
        }}
        onSubmit={handleChatSubmit}
        loading={isChatLoading}
        submitText="发送"
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Input.TextArea
            placeholder="系统角色设定（可选）"
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
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </div>

        {aiResponse && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              background: '#fafafa',
            }}
          >
            <ReactMarkdown>{aiResponse}</ReactMarkdown>
          </div>
        )}
      </DraggableModal>

      {/* OCR 识别对话框 */}
      <DraggableModal
        title="图片文字识别 (OCR)"
        open={ocrModalVisible}
        onCancel={() => {
          setOcrModalVisible(false);
          resetOcr();
        }}
        onSubmit={handleOcrSubmit}
        loading={isOcrLoading}
        submitText="开始识别"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleOcrFileChange}
            style={{ display: 'block' }}
          />
        </div>

        {ocrImageUrl && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <img
              src={ocrImageUrl}
              alt="OCR Preview"
              style={{ maxWidth: '100%', maxHeight: 300 }}
            />
          </div>
        )}

        {ocrResult && (
          <Input.TextArea
            value={ocrResult}
            readOnly
            autoSize={{ minRows: 4, maxRows: 8 }}
            style={{ marginTop: 16 }}
          />
        )}
      </DraggableModal>
    </>
  );
};

export default GlobalModals;
