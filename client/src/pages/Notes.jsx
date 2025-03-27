import { useEffect, useState } from 'react';
import { List, Card, Tag } from 'antd';
import { getNotes } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import Navbar1 from '@/components/Navbar';

const Notes = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  const fetchNotes = async () => {
    try {
      const fetchNotesData = await getNotes(user.id);
      setNotes(fetchNotesData.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      alert('获取笔记失败');
    }
  };
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <>
      <Navbar1 />
      <h1>笔记列表</h1>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={notes}
        className="p-4"
        renderItem={(item) => (
          <Card className="bg-blue-100 m-2" hoverable>
            <Card.Meta
              title={item.title}
              description={item.content.substring(0, 100) + '...'}
            />
            <div className="my-4">
              {item.tags.map((tag) => (
                <Tag color="cyan" key={tag}>
                  {tag}
                </Tag>
              ))}
            </div>
            <a href={`/notes/${item.id}`}>点击査看详情</a>
          </Card>
        )}
      />
    </>
  );
};
export default Notes;
