import { useEffect, useState } from 'react';
import { Input, Space, List, Layout, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { searchNotes, getNotes, getTags } from '@/api/noteApi'; // 搜索，查询标签
import { useStore } from '@/store/userStore';
import Navbar from '@/components/Navbar';

const { Search } = Input;

const Sousuo = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [notes, setNotes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const { Content } = Layout;
  const [tagsList, setTagsList] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  // 查询标签
  const fetchTagsData = async () => {
    try {
      const getTagsData = await getTags(user.id);
      console.log('getTagsData', getTagsData.data);
      setTagsList(getTagsData.data);
    } catch (error) {
      console.log('Failed to get tags:', error);
      alert('获取标签失败');
      setTagsList([]);
    }
  };
  useEffect(() => {
    fetchTagsData();
  }, []);

  // Tag 组件用法
  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t !== tag);
    console.log('You select:', nextSelectedTags);
    setSelectedTags(nextSelectedTags);
  };

  // 搜索笔记
  const onSearch = async (value) => {
    try {
      const result = await searchNotes(user.id, value, selectedTags);
      if (result.data.length === 0) {
        // alert('未找到相关笔记');
        setSearchResults([]);
      } else {
        console.log('Search results:', result.data);
        setSearchResults(result.data);
      }
    } catch (error) {
      console.log('Failed to search notes:', error);
      alert('搜索笔记失败');
      setSearchResults([]);
    }
  };

  return (
    <Layout>
      <Navbar />
      <Content>
        <div className="search-container">
          <Space direction="vertical" className="search-space">
            <Search
              placeholder="input search text"
              allowClear
              onSearch={onSearch}
              style={{ width: 200 }}
              enterButton
              className="search-input"
            />
            {/* 标签 */}
            {tagsList.map((tag) => (
              <Tag.CheckableTag
                key={tag}
                checked={selectedTags.includes(tag)}
                onChange={(checked) => handleChange(tag, checked)}
              >
                {tag}
              </Tag.CheckableTag>
            ))}
            {searchResults.length > 0 && (
              <List
                dataSource={searchResults}
                renderItem={(item) => (
                  <List.Item className="search-result-item">
                    <div className="note-info">
                      <h3 className="note-title">{item.title}</h3>
                      <p className="note-content">
                        {item.content.substring(0, 60) + '...'}
                      </p>
                      <a href={`/notes/${item.id}`}>查看详情</a>
                    </div>
                  </List.Item>
                )}
                className="search-result-list"
              />
            )}
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default Sousuo;
