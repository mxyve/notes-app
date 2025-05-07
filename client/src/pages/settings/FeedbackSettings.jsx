import { Layout, Input, Button, Spin } from 'antd';
import Navbar from '@/components/Navbar';
import { useStore } from '@/store/userStore';
import { useState } from 'react';

const { Content } = Layout;

const FeedbackSettings = () => {
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
      ></Content>
    </Layout>
  );
};
export default FeedbackSettings;
