import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { createNote, uploadImg } from '@/api/noteApi'; // 创建笔记
import { getCategories } from '@/api/categoryApi'; // 所有分类数据
import {
  Layout,
  Typography,
  Input,
  Button,
  Select,
  Tag,
  message,
  Switch,
} from 'antd';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import NoteWordCount from '@/components/NoteWordCount';

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
  const [wordCount, setWordCount] = useState(0);
  const [isPublic, setIsPublic] = useState(0);
  const [isDelete, setIsDelete] = useState(0);
  const [text, setText] = useState('hello md-editor-rt！');
  const quillRef = useRef(null);

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
        wordCount: wordCount,
        isPublic: isPublic,
        isDelete: 0,
      };
      console.log('即将发送给后端的新笔记数据:', newNoteData);
      await createNote(newNoteData);
      message.success('笔记创建成功');
      // navigate(`/notes/categories/${newNoteData.categoryId}`);
    } catch (error) {
      console.error('Failed to update note:', error);
      message.error('创建笔记失败');
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

  const handleImportMarkdown = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;

      // 尝试解析可能的YAML front matter
      const yamlRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
      const match = content.match(yamlRegex);

      if (match) {
        // 如果有YAML front matter
        const yamlContent = match[1];
        const markdownContent = match[2];

        // 这里可以添加YAML解析逻辑（如需要）
        // 例如解析标题、标签等元数据
        setContent(markdownContent);

        // 简单示例：从YAML中提取标题
        const titleMatch = yamlContent.match(/title:\s*["']?(.*?)["']?\n/);
        if (titleMatch && titleMatch[1]) {
          setTitle(titleMatch[1].trim());
        }
      } else {
        // 如果没有YAML front matter，直接设置内容
        setContent(content);
      }
    };
    reader.readAsText(file);

    // 重置input值，以便可以重复选择同一个文件
    event.target.value = '';
  };

  // 上传图片
  // 添加在组件内部
  // const onUploadImg = async (files) => {
  //   try {
  //     const response = await uploadImg(files[0], user.token);
  //     return response.url;
  //   } catch (error) {
  //     console.error('图片上传失败:', error);
  //     message.error('图片上传失败');
  //     return '';
  //   }
  // };
  // 图片上传处理函数
  // const imageHandler = async () => {
  //   const input = document.createElement('input');
  //   input.setAttribute('type', 'file');
  //   input.setAttribute('accept', 'image/*');
  //   input.click();

  //   input.onchange = async () => {
  //     const file = input.files[0];
  //     if (file) {
  //       try {
  //         const formData = new FormData();
  //         formData.append('image', file);

  //         const response = await uploadImage(formData);
  //         const imageUrl = response.data.url;

  //         const quill = quillRef.current.getEditor();
  //         const range = quill.getSelection();
  //         quill.insertEmbed(range.index, 'image', imageUrl);
  //         quill.setSelection(range.index + 1);
  //       } catch (error) {
  //         console.error('图片上传失败:', error);
  //       }
  //     }
  //   };
  // };

  const onUploadImg = async (files) => {
    try {
      const formData = new FormData();
      formData.append('image', files[0]);

      const response = await uploadImg(formData, user.token);
      return response.data.url; // 返回图片URL
    } catch (error) {
      message.error('图片上传失败');
      return '';
    }
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
            <div className="flex items-center gap-4 mb-4">
              <Button
                type="primary"
                onClick={() =>
                  document.getElementById('markdown-import').click()
                }
              >
                导入Markdown文件
              </Button>
              <input
                id="markdown-import"
                type="file"
                accept=".md,.markdown"
                onChange={handleImportMarkdown}
                style={{ display: 'none' }}
              />
            </div>
            {/* 添加一个 flex 容器来横向排列类型和标签部分 */}
            <div className="flex gap-4 mb-4">
              <div className="w-1/3">
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
              <div className="w-2/3">
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
                {/* 添加公开/私有开关 */}
                <div className="mb-4 flex items-center">
                  <span className="mr-2">是否公开:</span>
                  <Switch
                    checked={isPublic === 1}
                    onChange={(checked) => setIsPublic(checked ? 1 : 0)}
                    checkedChildren="公开"
                    unCheckedChildren="私有"
                  />
                  <span className="ml-2 text-gray-500">
                    {isPublic === 1 ? '所有人可见' : '仅自己可见'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      closable
                      onClose={() => handleRemoveTag(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <MdEditor
                onChange={(newContent) => setContent(newContent)}
                preview="edit" // 设置预览模式
                showToolbarName // 在工具栏下面显示对应的文字名称
                // ref={quillRef}
                onUploadImg={onUploadImg}
              />
              <NoteWordCount content={content} onCountChange={setWordCount} />
            </div>
          </div>
        </div>
        <Button type="primary" onClick={handleSubmit} className="mt-4">
          添加笔记
        </Button>
      </Content>
    </Layout>
  );
};

export default CreateNote;
