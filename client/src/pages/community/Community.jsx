import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  Layout,
  Pagination,
  message,
  Card,
  List,
  Tag,
  Space,
  Spin,
} from 'antd';
import {
  LikeOutlined,
  StarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { getPublicNotes } from '@/api/communityApi';
import dayjs from 'dayjs';

const { Content } = Layout;

const Community = () => {
  const [noteList, setNoteList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const fetchPublicNotes = async (page = 1) => {
    setIsLoading(true);
    try {
      const fetchedNote = await getPublicNotes(page, limit, 1);
      console.log('fetchedNote.data.data', fetchedNote.data.data);
      setNoteList(fetchedNote.data.data);
      setTotal(fetchedNote.data.total);
    } catch (error) {
      console.error('Failed to fetch note details:', error);
      message.error('获取笔记列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPublicNotes(page);
  };

  useEffect(() => {
    fetchPublicNotes();
  }, []);

  const IconText = ({ icon, text }) => (
    <Space className="text-gray-600">
      {icon}
      {text}
    </Space>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 max-w-4xl mx-auto w-full">
        <Card title="社区笔记" className="shadow-sm">
          {isLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <List
                itemLayout="vertical"
                size="large"
                dataSource={noteList}
                renderItem={(note) => (
                  <List.Item
                    key={note.id}
                    actions={[
                      <IconText
                        icon={<LikeOutlined />}
                        text={note.like_count || 0}
                        key="list-vertical-like"
                      />,
                      <IconText
                        icon={<StarOutlined />}
                        text={note.collection_count || 0}
                        key="list-vertical-star"
                      />,
                      <IconText
                        icon={<CalendarOutlined />}
                        text={dayjs(note.created_at).format('YYYY-MM-DD')}
                        key="list-vertical-date"
                      />,
                    ]}
                    extra={
                      note.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <Tag color="blue" key={tag}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )
                    }
                  >
                    <List.Item.Meta
                      title={
                        <a
                          href={`/notes/${note.id}`}
                          className="text-lg font-medium hover:text-blue-600"
                        >
                          {note.title}
                        </a>
                      }
                      description={
                        <p className="text-gray-500 line-clamp-2">
                          {note.content || '暂无描述'}
                        </p>
                      }
                    />
                  </List.Item>
                )}
              />
              <div className="flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={limit}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  className="ant-pagination"
                />
              </div>
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default Community;
