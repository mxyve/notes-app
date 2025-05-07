import {
  Layout,
  Input,
  Button,
  Spin,
  Form,
  Avatar,
  message,
  Typography,
  Upload,
} from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { useState, useEffect } from 'react';
import { updateUser, getUser, updateUserAvatar } from '@/api/userApi';

const { Content } = Layout;
const { Text } = Typography;

const UserSettings = () => {
  const { user, setUser } = useStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await getUser(user.id);
      const userData = response.data;
      console.log('userData', userData);
      form.setFieldsValue({
        username: userData.username,
        email: userData.email,
        nickname: userData.nickname,
        signature: userData.signature,
        password: userData.password,
      });
      setAvatarUrl(userData.avatar_url);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('获取用户信息失败');
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const updateData = {
        ...values,
        avatarUrl: avatarUrl,
      };

      console.log('Sending update data:', updateData);
      await updateUser(user.id, updateData);
      message.success('用户信息更新成功');
      setLoading(false);
      setUser({ ...user, ...updateData });
    } catch (error) {
      console.error('Error updating user:', error);
      message.error('更新用户信息失败');
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (info) => {
    const { file } = info;

    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return;
    }

    try {
      setUploading(true);
      const response = await updateUserAvatar(user.id, file);

      if (response.data) {
        setAvatarUrl(response.data.avatar_url);
        message.success('头像上传成功');
        // Update global user state
        setUser({ ...user, avatar_url: response.data.avatar_url });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      message.error('头像上传失败');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      handleAvatarUpload({ file });
      return false; // Prevent automatic upload
    },
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
        <Spin spinning={loading}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Typography.Title level={3} style={{ marginBottom: 24 }}>
              用户设置
            </Typography.Title>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                src={avatarUrl || null}
                icon={!avatarUrl && <UserOutlined />}
                size={128}
                style={{ marginBottom: 16 }}
              />
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} loading={uploading}>
                  更换头像
                </Button>
              </Upload>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item label="昵称" name="nickname">
                <Input placeholder="请输入昵称" />
              </Form.Item>

              <Form.Item label="个性签名" name="signature">
                <Input.TextArea
                  placeholder="请输入个性签名"
                  rows={4}
                  maxLength={100}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="新密码"
                name="password"
                rules={[{ required: true, message: '请输入新密码' }]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Spin>
      </Content>
    </Layout>
  );
};

export default UserSettings;
