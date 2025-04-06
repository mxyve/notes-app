import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { createNote } from '@/api/noteApi'; // 创建笔记
import { getCategories } from '@/api/categoryApi'; // 所有分类数据
import { Layout, Typography, Input, Button, Select, Tag, message } from 'antd';
import Markdown from 'markdown-to-jsx';

const CreateNote = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const { Content } = Layout;
  const { Title } = Typography;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate]);

  // 获取分类
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse] = await Promise.all([getCategories()]);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('获取数据失败');
      }
    };
    fetchData();
  });

  // 创建笔记
  const handleSubmit = async () => {
    try {
      const newNoteData = {
        title,
        content,
        categoryId,
        tags,
        userId: user.id,
      };
      await createNote(newNoteData);
      message.success('笔记创建成功');
      navigate('/notes');
    } catch (error) {
      console.error('Failed to update note:', error);
      message.error('更新笔记失败');
    }
  };

  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  const handleRemoveTag = (removedTag) => {
    const newTags = tags.filter((tag) => tag != removedTag);
    setTags(newTags);
  };

  const cleanMarkdownContent = (content) => {
    return content.replace(/<[^>]+>/g, (match) => {
      return match.replace(/(\w+)="true"/g, (attr) => {
        return attr.replace('="true"', '');
      });
    });
  };

  return (
    <Layout className="flex flex-col min-h-screen">
      <Navbar />
      <Content className="p-4 ">
        <div className="flex gap-4">
          <div className="flex-1 h-[90vh] overflow-y-auto">
            <Typography>
              <Title>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入标题"
                  className="w-full text-4xl border-0 focus:ring-0 outline-none"
                />
              </Title>
            </Typography>

            <div className="mb-4">
              <label className="block mb-2">类型</label>
              <Select
                value={categoryId}
                onChange={(value) => setCategoryId(value)}
                placeholder="请选择笔记类型"
                className="w-full"
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">标签</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={inputTag}
                  onChange={(e) => setInputTag(e.target.value)}
                  placeholder="输入标签"
                  onPressEnter={handleAddTag}
                  className="flex-1"
                />
                <Button onClick={handleAddTag} className="w-20">
                  添加标签
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <Tag key={tag} closable onClose={() => handleRemoveTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>

            <div className="flex-1 ">
              <label className="block mb-2">内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                cols={50}
                placeholder="请输入 Markdown 内容"
                className="borderrounded w-full overflow-y-auto h-[60vh]"
              />
            </div>
          </div>
          <div className="flex-1 h-[90vh] overflow-y-auto">
            <div className="mt-4">
              <Markdown
                options={{
                  forceBlock: true,
                  overrides: {
                    img: {
                      component: ({ src, alt }) => (
                        <img
                          src={src}
                          alt={alt}
                          style={{ maxWidth: '100%', height: '100%' }}
                        />
                      ),
                    },
                  },
                }}
              >
                {cleanMarkdownContent(content)}
              </Markdown>
            </div>
          </div>
        </div>
        <Button type="primary" onClick={handleSubmit} className="mt-4">
          创建笔记
        </Button>
      </Content>
    </Layout>
  );
};

export default CreateNote;
