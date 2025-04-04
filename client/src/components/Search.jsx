import { useEffect, useState } from 'react';
import { Input, Space, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { searchNotes, getNotes } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import './Sousuo.css';

const { Search } = Input;

const Sousuo = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [notes, setNotes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  const fetchNotes = async () => {
    if (!user) return;
    try {
      const fetchNotesData = await getNotes(user.id);
      setNotes(fetchNotesData.data);
    } catch (error) {
      console.log('Failed to fetch notes:', error);
      alert('获取笔记失败');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const onSearch = async (value) => {
    if (!user) {
      alert('请先登录');
      return;
    }
    try {
      const result = await searchNotes(user.id, value);
      if (result.data.length === 0) {
        alert('未找到相关笔记');
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
                </div>
              </List.Item>
            )}
            className="search-result-list"
          />
        )}
      </Space>
    </div>
  );
};

export default Sousuo;
