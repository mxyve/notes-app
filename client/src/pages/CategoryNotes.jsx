import React, { useState, useEffect } from 'react';
import { List, Card, Tag } from 'antd';
import { getNotesByCategory } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const CategoryNotes = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [notes, setNotes] = useState([]);
  const { Content } = Layout;

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchNotesByCategory = async () => {
      try {
        const fetchedNotes = await getNotesByCategory(user.id, categoryId);
        console.log('Fetched fetchedNotes:', fetchedNotes.data);
        setNotes(fetchedNotes.data);
      } catch (error) {
        console.error('Failed to fetch notes by category:', error);
        alert('获取笔记失败');
      }
    };
    fetchNotesByCategory();
  }, [categoryId]);

  if (!notes) return <div>Loading...</div>;

  return (
    <Layout>
      <Navbar />
      <Content>
        <h1>分类笔记列表</h1>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={notes}
          renderItem={(item) => (
            <Card className="bg-blue-100 m-2">
              <Card.Meta
                title={item.title}
                description={item.content.substring(0, 60) + '...'}
              />
              {item.tags && item.tags.length > 0 && (
                <div className="tags-container">
                  {item.tags.map((tag) => (
                    <Tag color="cyan" key={tag}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
              <a href={`/notes/${item.id}`}>查看详情</a>
            </Card>
          )}
        />
      </Content>
    </Layout>
  );
};

export default CategoryNotes;
