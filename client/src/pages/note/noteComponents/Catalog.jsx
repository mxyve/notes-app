import React, { useState } from 'react';
import { Layout, Anchor, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
const Catalog = ({ catalog }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { Sider } = Layout;

  const anchorItems = catalog.map((item) => ({
    key: item.text,
    href: `#${item.text}`,
    title: item.text,
    level: item.level,
  }));

  return (
    <Sider
      width={280}
      collapsedWidth={0}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      trigger={null}
      className="bg-white border-l shadow-sm"
      style={{
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
      }}
    >
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h4 className="mb-0">目录</h4>
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <Anchor items={anchorItems} className="text-sm" affix={false} />
        </div>
      </div>
      {collapsed && (
        <Button
          type="text"
          icon={<MenuUnfoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="fixed top-4 right-6 z-10 bg-white p-2 rounded-md shadow-md"
        />
      )}
    </Sider>
  );
};

export default Catalog;
