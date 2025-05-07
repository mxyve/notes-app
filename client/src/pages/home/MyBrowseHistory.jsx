import React from 'react';
import { usePersistentBrowseHistoryStore } from '@/store/userBrowseHistoryStore';
import { Link } from 'react-router-dom';
import { Card, List, Typography, Empty } from 'antd';
import { useStore } from '@/store/userStore';
import dayjs from 'dayjs';

const { Text } = Typography;

const MyBrowseHistory = () => {
  const { user } = useStore();
  const { browseHistory } = usePersistentBrowseHistoryStore(user?.id);

  // 对浏览记录按照时间戳降序排列
  const sortedBrowseHistory = React.useMemo(() => {
    return [...browseHistory].sort((a, b) => b.timestamp - a.timestamp);
  }, [browseHistory]);

  // 格式化时间显示
  const formatTime = (timestamp) => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm');
  };

  return (
    <Card title="浏览记录">
      {sortedBrowseHistory.length > 0 ? (
        <List
          dataSource={sortedBrowseHistory}
          renderItem={(record) => (
            <List.Item
              key={`${record.noteId}-${record.timestamp}`}
              style={{ padding: '8px 0' }}
            >
              <div className="flex justify-between w-full">
                <Link to={`/community/note/${record.noteId}`}>
                  <Text
                    ellipsis
                    style={{ maxWidth: '200px' }}
                    className="hover:text-blue-500 transition-colors"
                  >
                    {record.noteTitle}
                  </Text>
                </Link>
                <Text type="secondary" className="text-xs">
                  {formatTime(record.timestamp)}
                </Text>
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无浏览记录"
          style={{ padding: '24px 0' }}
        />
      )}
    </Card>
  );
};

export default MyBrowseHistory;
