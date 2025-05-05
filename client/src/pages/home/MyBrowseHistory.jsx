import React from 'react';
import useBrowseHistoryStore from '@/store/userBrowseHistoryStore';
import { Link } from 'react-router-dom';
import { Card, List, Typography } from 'antd';
import { useStore } from '@/store/userStore';

const { Text } = Typography;

const MyBrowseHistory = () => {
  const { user } = useStore();
  const { browseHistory } = useBrowseHistoryStore(user.id);

  // 对浏览记录按照时间戳降序排列
  const sortedBrowseHistory = [...browseHistory].sort(
    (a, b) => b.timestamp - a.timestamp,
  );

  return (
    <Card title="浏览记录">
      <List
        dataSource={sortedBrowseHistory}
        renderItem={(record) => (
          <List.Item key={record.noteId}>
            <Link to={`/community/note/${record.noteId}`}>
              <Text>{record.noteTitle}</Text>
            </Link>
            <Text type="secondary" className="ml-2 text-xs">
              {new Date(record.timestamp).toLocaleString()}
            </Text>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default MyBrowseHistory;
