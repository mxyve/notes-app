// 使用 antd 组件 + unocss 编写的自定义导航栏组件
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Space, Button, Modal } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  AppstoreOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useStore } from '@/store/userStore';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation(); // 使用 useLocation 钩子获取当前路由位置

  // const handleLogout = () => {
  //   if (window.confirm('确定退出?')) {
  //     logout();
  //     navigate('/login');
  //   }
  // };

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

  // 根据当前路由设置选中的菜单项
  const selectedKeys = React.useMemo(() => {
    switch (location.pathname) {
      case '/':
        return ['home'];
      case '/categories':
        return ['categories'];
      case '/notes':
        return ['notes'];
      default:
        return [];
    }
  });

  return (
    <Header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={selectedKeys}
        className="w-200"
        items={[
          {
            key: 'home',
            label: (
              <Space size="middle">
                <HomeOutlined />
                <span>首页</span>
              </Space>
            ),
            onClick: () => navigate('/'),
          },
          {
            key: 'categories',
            label: (
              <Space size="middle">
                <AppstoreOutlined />
                <span>分类</span>
              </Space>
            ),
            onClick: () => navigate('/categories'),
          },
          {
            key: 'notes',
            label: (
              <Space size="middle">
                <FileOutlined />
                <span>笔记</span>
              </Space>
            ),
            onClick: () => navigate('/notes'),
          },
        ]}
      />

      <div>
        {user ? (
          <Space onClick={handleLogout}>
            {user.avatar_url ? (
              <Avatar src={user.avatar_url} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
            <Text className="ml-2 text-white">
              {user.nickname || user.username}
            </Text>
          </Space>
        ) : (
          <Button type="primary" onClick={() => navigate('/login')}>
            登录
          </Button>
        )}
      </div>
    </Header>
  );
};

export default Navbar;

// import React, { useState } from 'react';

// import {
//   AppstoreOutlined,
//   ContainerOutlined,
//   DesktopOutlined,
//   MailOutlined,
//   MenuFoldOutlined,
//   MenuUnfoldOutlined,
//   PieChartOutlined,
// } from '@ant-design/icons';
// import { Button, Menu } from 'antd';

// import { useNavigate } from 'react-router-dom';

// const items = [
//   { key: '1', icon: <PieChartOutlined />, label: '知识库' },
//   { key: '2', icon: <DesktopOutlined />, label: 'AI' },
//   { key: '3', icon: <ContainerOutlined />, label: '生活简谱' },
//   {
//     key: 'sub1',
//     label: '待办箱',
//     icon: <MailOutlined />,
//     children: [
//       { key: '5', label: 'Option 5' },
//       { key: '6', label: 'Option 6' },
//       { key: '7', label: 'Option 7' },
//       { key: '8', label: 'Option 8' },
//     ],
//   },
//   {
//     key: 'sub2',
//     label: '小记',
//     icon: <AppstoreOutlined />,
//     children: [
//       { key: '9', label: 'Option 9' },
//       { key: '10', label: 'Option 10' },
//       {
//         key: 'sub3',
//         label: 'Submenu',
//         children: [
//           { key: '11', label: 'Option 11' },
//           { key: '12', label: 'Option 12' },
//         ],
//       },
//     ],
//   },
// ];

// const Navbar = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const toggleCollapsed = () => {
//     setCollapsed(!collapsed);
//   };
//   return (
//     <div style={{ width: 256 }}>
//       <Button
//         type="primary"
//         onClick={toggleCollapsed}
//         style={{ marginBottom: 16 }}
//       >
//         {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
//       </Button>
//       <Menu
//         defaultSelectedKeys={['1']}
//         defaultOpenKeys={['sub1']}
//         mode="inline"
//         theme="light"
//         inlineCollapsed={collapsed}
//         items={items}
//       />
//     </div>
//   );
// };
// export default Navbar;
