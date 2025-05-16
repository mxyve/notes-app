import React, { useState, useEffect } from 'react';
import { Tag, Layout } from 'antd';
import { getNote } from '@/api/noteApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Markdown from 'markdown-to-jsx';

const Note = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const { Content } = Layout;

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  useEffect(() => {
    const fetchNoteDetails = async () => {
      try {
        const fetchedNote = await getNote(id);
        console.log(fetchedNote);
        setNote(fetchedNote.data);
      } catch (error) {
        console.error('Failed to fetch note details:', error);
        alert('获取笔记详情失败');
        navigate('/notes');
      }
    };

    fetchNoteDetails();
  }, [id, navigate]);

  if (!note) return <div>Loading...</div>;

  return (
    <Layout>
      <Navbar />
      <Content className="p-8 flex-1 h-[100vh] overflow-y-auto">
        <h1 className="text-3xl mb-4">{note.title}</h1>
        {note.tags.map((tag) => (
          <Tag color="cyan" key={tag}>
            {tag}
          </Tag>
        ))}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* 使用 markdown-to-jsx 进行解析 */}
          <Markdown
            options={{
              overrides: {
                img: {
                  component: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  ),
                },
              },
            }}
          >
            {note.content}
          </Markdown>
        </div>
      </Content>
    </Layout>
  );
};

export default Note;
