import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  Tag,
  message,
  Select,
  Layout,
  Typography,
  Switch,
} from 'antd';
import { updateNote, getNote } from '@/api/noteApi';
import { getCategories } from '@/api/categoryApi';
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import NoteWordCount from '@/components/NoteWordCount';

const EditNote = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { user } = useStore();
  const [tags, setTags] = useState([]);
  const [inputTag, setInputTag] = useState('');
  const [categories, setCategories] = useState([]);
  const [noteData, setNoteData] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { Content } = Layout;
  const { Title } = Typography;
  const [wordCount, setWordCount] = useState(0);
  const [isPublic, setIsPublic] = useState(0);

  // 在组件挂载或者 noteId 改变时异步获取笔记数据与分类数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noteResponse, categoriesResponse] = await Promise.all([
          getNote(noteId),
          getCategories(),
        ]);
        const fetchedNoteData = noteResponse.data;
        setNoteData(fetchedNoteData);
        setTitle(fetchedNoteData.title);
        setContent(fetchedNoteData.content);
        setCategoryId(fetchedNoteData.categoryId);
        setTags(fetchedNoteData.tags);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        message.error('获取数据失败');
      }
    };
    fetchData();
  }, [noteId]);

  // handleSubmit 函数的主要功能是收集用户输入的笔记信息，调用 updateNote 函数将这些信息发送到服务器以更新指定 noteId 的笔记，根据操作结果给出相应的提示信息，并在更新成功后导航到 /notes 页面。
  // 使用 async/await 语法处理异步操作，确保在 updateNote 函数执行完成后再继续后续操作
  const handleSubmit = async () => {
    try {
      // 收集需要更新的笔记数据,将用户输入的笔记信息（title、content、categoryId、tags）和用户 ID 组合成一个对象
      const updatedNoteData = {
        // 笔记的标题，由外部作用域提供
        title,
        content,
        categoryId,
        tags,
        // 笔记所属用户的 ID，从 user 对象中获取
        userId: user.id,
        wordCount: wordCount,
        isPublic: isPublic,
      };
      // 调用 updateNote 函数，传入笔记 ID 和更新的数据，等待服务器响应
      await updateNote(noteId, updatedNoteData);
      message.success('笔记更新成功');
      navigate('/notes');
    } catch (error) {
      console.error('Failed to update note: ', error);
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
    const newTags = tags.filter((tag) => tag !== removedTag);
    setTags(newTags);
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
                value={content}
                onChange={(newContent) => setContent(newContent)}
                preview="edit" // 设置预览模式
                showToolbarName // 在工具栏下面显示对应的文字名称
              />
              <NoteWordCount content={content} onCountChange={setWordCount} />
            </div>
          </div>
        </div>
        <Button type="primary" onClick={handleSubmit} className="mt-4">
          更新笔记
        </Button>
      </Content>
    </Layout>
  );
};

export default EditNote;
