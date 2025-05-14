import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Layout, Button, Input } from 'antd';
import { ocr } from '@/api/aiApi';
import DraggableModal from './DraggableModal';

const OCR = () => {
  const { Content } = Layout;
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleOCR = async () => {
    if (!file) {
      setError('请先选择一个图片文件');
      return;
    }
    try {
      setLoading(true);
      const resultText = await ocr(file);
      setResult(resultText);
      setError('');
    } catch (error) {
      console.error('OCR 识别失败:', error);
      setError('OCR 识别失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const showOCRModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFile(null);
    setImageUrl('');
    setResult('');
  };

  return (
    <Layout>
      <Navbar showOCRModal={showOCRModal} />
      <Content style={{ padding: '24px' }}>
        <h1>OCR 传图识字</h1>
        <Button type="primary" onClick={showOCRModal}>
          打开OCR识别对话框
        </Button>

        <DraggableModal
          title="OCR图片文字识别"
          open={isModalVisible}
          onCancel={handleCancel}
          onSubmit={handleOCR}
          loading={loading}
          submitText="识别文字"
          width={900}
        >
          <div style={{ marginBottom: 16 }}>
            <input
              type="file"
              id="imageInput"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleFileChange}
            />
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>
          )}

          {imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <h3>图片预览：</h3>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ maxWidth: '100%', height: 'auto', maxHeight: '300px' }}
              />
            </div>
          )}

          {result && (
            <div style={{ marginTop: 16 }}>
              <h3>识别结果：</h3>
              <Input.TextArea
                value={result}
                autoSize={{ minRows: 4, maxRows: 8 }}
                readOnly
              />
            </div>
          )}
        </DraggableModal>
      </Content>
    </Layout>
  );
};

export default OCR;
