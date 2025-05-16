import { useEffect, useState } from 'react';
import { Input, Space, List, Layout, Tag, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { searchNotes, getNotes, getTags } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import Navbar from '@/components/Navbar';
import GlobalModals from '@/components/GlobalModals';

const { Search } = Input;
const { Title, Text } = Typography;
const { Content } = Layout;

const Sousuo = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [searchResults, setSearchResults] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  // 查询标签
  const fetchTagsData = async () => {
    try {
      const getTagsData = await getTags(user.id);
      setTagsList(getTagsData.data);
    } catch (error) {
      console.log('Failed to get tags:', error);
      setTagsList([]);
    }
  };

  useEffect(() => {
    fetchTagsData();
  }, []);

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    setSelectedTags(nextSelectedTags);
  };

  // 搜索笔记
  const onSearch = async (value) => {
    if (!value.trim()) return;

    setLoading(true);
    try {
      const result = await searchNotes(user.id, value, selectedTags);
      setSearchResults(result.data || []);
    } catch (error) {
      console.log('Failed to search notes:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 max-w-6xl mx-auto w-full">
        <Card className="shadow-sm mb-6">
          <Title level={3} className="mb-4 text-center">
            搜索笔记
          </Title>

          <div className="flex flex-col items-center">
            <Search
              placeholder="输入关键词搜索笔记..."
              allowClear
              enterButton="搜索"
              size="large"
              onSearch={onSearch}
              className="w-full max-w-xl mb-6"
              loading={loading}
            />

            <div className="w-full mb-6">
              <Text className="block mb-2 text-gray-600">按标签筛选：</Text>
              <Space wrap>
                {tagsList.map((tag) => (
                  <Tag.CheckableTag
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onChange={(checked) => handleChange(tag, checked)}
                    className="px-3 py-1 rounded-full border border-gray-300 hover:border-blue-400 transition-colors"
                  >
                    {tag}
                  </Tag.CheckableTag>
                ))}
              </Space>
            </div>
          </div>

          {searchResults.length > 0 ? (
            <List
              dataSource={searchResults}
              loading={loading}
              renderItem={(item) => (
                <List.Item className="hover:bg-gray-50 px-4 py-3 rounded transition-colors">
                  <Card className="w-full hover:shadow-md transition-shadow">
                    <div className="flex flex-col">
                      <Title level={5} className="mb-2">
                        {item.title}
                      </Title>
                      <Text className="text-gray-600 mb-3">
                        {item.content.substring(0, 100) +
                          (item.content.length > 100 ? '...' : '')}
                      </Text>
                      <a
                        href={`/notes/${item.id}`}
                        className="text-blue-500 hover:text-blue-700 self-end"
                      >
                        查看详情 →
                      </a>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              {loading ? '搜索中...' : '暂无搜索结果，请输入关键词搜索'}
            </div>
          )}
        </Card>
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default Sousuo;
