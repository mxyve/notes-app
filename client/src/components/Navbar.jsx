import React, { useState, useEffect } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  BookOutlined,
  FormOutlined,
  DeleteOutlined,
  CarryOutOutlined,
  FileAddOutlined,
  HomeOutlined,
  RobotOutlined,
  SearchOutlined,
  PlusSquareOutlined,
  BgColorsOutlined,
  CustomerServiceOutlined,
  WechatWorkOutlined,
  ScanOutlined,
  SettingOutlined,
  GatewayOutlined,
} from '@ant-design/icons';
import {
  Button,
  Layout,
  Menu,
  theme,
  Space,
  Avatar,
  Typography,
  Modal,
  Input,
  FloatButton,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/userStore';
const { Sider } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  // 从 localStorage 中获取 collapsed 状态，如果没有则默认为 false
  // collapsed为true时表示收缩，为false时表示展开
  const [collapsed, setCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem('collapsed');
    return storedCollapsed ? JSON.parse(storedCollapsed) : false;
  });
  // 每次 collapsed 状态改变时，更新 localStorage
  useEffect(() => {
    localStorage.setItem('collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const { Text } = Typography;
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        logout();
        navigate('/login');
      },
    });
  };

  const selectedKeys = React.useMemo(() => {
    switch (window.location.pathname) {
      case '/':
        return ['home'];
      case '/categories':
        return ['categories'];
      case '/notes':
        return ['notes'];
      default:
        return [];
    }
  }, []);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={60} // 收缩时的宽度
      width={200} // 展开时的宽度
      style={{
        height: '100vh',
        backgroundColor: 'white',
      }}
    >
      <div>
        {user ? (
          <Space onClick={handleLogout} style={{ margin: '15px' }}>
            {user.avatar_url ? (
              <Avatar src={user.avatar_url} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
            {!collapsed && (
              <Text
                className="ml-2 text-black"
                style={{
                  whiteSpace: 'nowrap',
                  flex: 1, // 让文本元素尽可能占据剩余空间
                  overflow: 'hidden', // 隐藏超出容器的部分
                  textOverflow: 'ellipsis', // 超出部分显示省略号
                }}
              >
                欢迎 {user.nickname || user.username} !
              </Text>
            )}
          </Space>
        ) : (
          <Button type="primary" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </div>

      {/* 导航栏收缩时 */}
      {collapsed && (
        <Space
          direction="vertical" // 设置子元素垂直排列
          style={{
            marginTop: '10px',
            paddingLeft: '20px',
            width: '100%',
          }}
          size="middle"
        >
          <PlusSquareOutlined style={{ fontSize: '20px' }} />
          <SearchOutlined
            onClick={() => navigate('/search')}
            style={{ fontSize: '20px' }}
          />
        </Space>
      )}

      {/* 导航栏展开时 */}
      {!collapsed && (
        <Space
          direction="horizontal" // 设置子元素水平排列
          style={{
            paddingLeft: '18px',
            margin: '10px 0px',
          }}
        >
          <Input
            placeholder="搜索"
            onClick={() => navigate('/search')}
            prefix={<SearchOutlined />}
          />
          <PlusSquareOutlined
            style={{
              marginRight: '10px',
              fontSize: '22px',
            }}
          />
        </Space>
      )}

      <Menu
        theme="light"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={selectedKeys}
        items={[
          {
            key: 'home',
            icon: <HomeOutlined />,
            label: (
              <Space>
                {/* <HomeOutlined /> */}
                <span>开始</span>
              </Space>
            ),
            onClick: () => navigate('/'),
          },
          {
            key: 'AI',
            icon: <RobotOutlined />,
            label: (
              <Space>
                {/* <VideoCameraOutlined /> */}
                <span>AI助手</span>
              </Space>
            ),
            children: [
              {
                key: 'chat',
                label: 'AI问答',
                onClick: () => navigate('/ai/chat'),
              },
              {
                key: 'ocr',
                label: '图文识别',
                onClick: () => navigate('/ai/ocr'),
              },
            ],
          },
          {
            key: 'categories',
            icon: <BookOutlined />,
            label: (
              <Space>
                {/* <VideoCameraOutlined /> */}
                <span>知识库</span>
              </Space>
            ),
            onClick: () => navigate('/categories'),
          },
          // {
          //   key: 'notes',
          //   icon: <FileAddOutlined />,
          //   label: (
          //     <Space>
          //       {/* <FileAddOutlined /> */}
          //       <span>笔记</span>
          //     </Space>
          //   ),
          //   onClick: () => navigate('/notes'),
          // },
          {
            key: 'todoList',
            icon: <CarryOutOutlined />,
            label: (
              <Space>
                {/* <CarryOutOutlined /> */}
                <span>待办箱</span>
              </Space>
            ),
            onClick: () => navigate('/todoList'),
          },
          {
            key: '5',
            icon: <FormOutlined />,
            label: (
              <Space>
                {/* <FormOutlined /> */}
                <span>小记</span>
              </Space>
            ),
          },
          {
            key: 'drawing',
            icon: <BgColorsOutlined />,
            label: (
              <Space>
                {/* <FormOutlined /> */}
                <span>画板</span>
              </Space>
            ),
            onClick: () => navigate('/drawing'),
          },
          {
            key: 'community',
            icon: <GatewayOutlined />,
            label: (
              <Space>
                <span>社区</span>
              </Space>
            ),
            onClick: () => navigate('/community'),
          },
          {
            key: '6',
            icon: <DeleteOutlined />,
            label: (
              <Space>
                {/* <DeleteOutlined /> */}
                <span>笔记回收站</span>
              </Space>
            ),
            onClick: () => navigate('/recycleBin'),
          },
        ]}
      />
      {/* 悬浮按钮 */}
      <FloatButton.Group
        trigger="click"
        type="primary"
        // style={{ insetInlineEnd: 300 }
        icon={<RobotOutlined />}
        placement="top"
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '10px', // 根据导航栏状态调整left值
        }}
      >
        <FloatButton
          icon={<ScanOutlined />}
          // href=""
          tooltip={<div>反馈</div>}
        />
        <FloatButton
          icon={<SettingOutlined />}
          // href=""
          tooltip={<div>设置</div>}
        />
      </FloatButton.Group>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
    </Sider>
  );
};

export default Navbar;
