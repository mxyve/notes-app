// 不用对话框版
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { Layout, Spin, Button } from 'antd';
import { ocr } from '@/api/aiApi';

const OCR = () => {
  const { Content } = Layout;
  const [file, setFile] = useState(null); // 存储用户选择的文件
  const [result, setResult] = useState(''); // 存储 OCR 识别结果
  const [error, setError] = useState(''); // 存储错误信息
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false); // 控制加载状态

  // 处理文件选择
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(''); // 清除之前的错误信息
      // 图片预览 URL
      const url = URL.createObjectURL(selectedFile);
      console.log('url:', url);
      setImageUrl(url);
    }
  };

  // 处理 OCR 识别
  const handleOCR = async () => {
    if (!file) {
      setError('请先选择一个图片文件');
      return;
    }
    try {
      setLoading(true); // 开始加载动画
      // 调用 OCR 函数
      const resultText = await ocr(file);
      setResult(resultText);
      setError('');
    } catch (error) {
      console.error('OCR 识别失败:', error);
      setError('OCR 识别失败，请稍后再试');
    } finally {
      setLoading(false); // 结束加载动画
    }
  };

  return (
    <Layout>
      <Navbar />
      <Content>
        <div className="container">
          <h1>OCR 传图识字</h1>
          <input
            type="file"
            id="imageInput"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleFileChange}
          />
          <Button onClick={handleOCR} disabled={!file} loading={loading}>
            识别图片文字
          </Button>
          {error && <div className="error">{error}</div>}
          {result && <div className="result">{result}</div>}
          {imageUrl && (
            <div>
              <h3>图片预览：</h3>
              <img
                src={imageUrl}
                alt="Preview"
                style={{ maxWidth: '30%', height: 'auto' }}
              />
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default OCR;
