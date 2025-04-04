import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tag, message, Select } from 'antd';
import { updateNote, getNote } from '@/api/noteApi'; // 引入更新笔记和获取笔记的 API
import { getCategories } from '@/api/categoryApi'; //引入获取分类的 API
import { useStore } from '@/store/userStore';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import NoteForm from '@/components/NoteForm';

const EditNote = () => {
  const navigate = useNavigate();
  const { noteId } = useParams(); // 从路由参数中获取笔记 ID
  const { user } = useStore(); // 从全局状态中获取当前用户信息
  const [tags, setTags] = useState([]); // 标签状态，用于存储笔记的标签
  //   const [inputTag, setInputTag] = useState(''); // 输入框中的标签内容
  //   const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState({});
  //   const [noteData, setNoteData] = useState(null);

  // 使用 useEffect 钩子在组件加载时获取分类数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const noteResponse = await getNote(noteId); // 调⽤ API 获取当前编辑的笔记const noteData = noteResponse.data; // 获取笔记数据
        const noteData = noteResponse.data;
        const values = {
          title: noteData.title, // 笔记标题
          content: noteData.content, // 笔记内容
          categoryId: noteData.categoryId, // 笔记分类
          tags: noteData.tags, // 笔记标签
        };
        console.log(noteData);
        // 同时请求笔记数据和分类数据
        // const [noteResponse, categoriesResponse] = await Promise.all([
        //   getNote(noteId), // 获取当前编辑的笔记
        //   getCategories(), // 获取所有分类
        // ]);
        // const fetchedNoteData = noteResponse.data; // 获取笔记数据
        // setNoteData(fetchedNoteData); // 更新笔记数据状态
        // setTags(fetchedNoteData.tags); // 设置笔记的标签
        setInitialValues(values);
        setTags(noteData.tags || []);
        form.setFieldsValue(values);
        // setCategories(categoriesResponse.data); // 设置分类数据
      } catch (error) {
        console.error('Failed to fetch data:', error); // 打印错误信息
        message.error('获取数据失败'); // 显示错误提示
      }
    };
    fetchData();
  }, [noteId]); // 依赖项为 noteId

  //   useEffect(() => {
  //     if (noteData) {
  //       form.setFieldsValue({
  //         title: noteData.title,
  //         content: noteData.content,
  //         categoryId: noteData.categoryId,
  //         tags: noteData.tags,
  //       });
  //       setTags(noteData.tags || []);
  //       console.log('noteData的值:', noteData);
  //       console.log('form:-=-=', form);
  //     }
  //   }, [noteData, form]);

  // 提交表单时的处理函数
  const handleSubmit = async (values) => {
    console.log(values);
    try {
      const noteData = {
        ...values,
        // tags,
        userId: user.id,
      };
      await updateNote(noteId, noteData);
      message.success('笔记更新成功');
      navigate('/notes');
    } catch (error) {
      console.error('Failed to create note: ', error);
      message.error('更新笔记失败');
    }
  };

  //   // 输入框内容变化时的处理函数
  //   const handleInputTagChange = (e) => {
  //     setInputTag(e.target.value);
  //   };

  //   // 添加标签的处理函数
  //   const handleAddTag = () => {
  //     if (inputTag && !tags.includes(inputTag)) {
  //       setTags([...tags, inputTag]);
  //       setInputTag('');
  //     }
  //   };

  //   // 删除标签的处理函数
  //   const handleRemoveTag = (removedTag) => {
  //     const newTags = tags.filter((tag) => tag !== removedTag);
  //     setTags(newTags);
  //   };

  // 渲染表单组件
  return (
    <>
      <Navbar />
      <div className="p-4">
        <h1>编辑笔记</h1>
        <NoteForm
          form={form} // 绑定表单实例
          initialValues={initialValues} // 传递表单初始值
          onSubmit={handleSubmit} // 传递表单提交的回调函数
          submitButtonText="更新笔记" // 设置提交按钮的⽂本
        />
        {/* <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="max-w-2xl mx-auto"
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入笔记标题' }]}
          >
            <Input placeholder="请输入笔记标题" />
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入笔记内容' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入笔记内容" />
          </Form.Item>

          <Form.Item
            label="类型"
            name="categoryId"
            rules={[{ required: true, message: '请选择笔记类型' }]}
          >
            <Select placeholder="请选择笔记类型">
              {' '}
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {' '}
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div className="mb-4">
            <label className="block mb-2">标签</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={inputTag}
                onChange={handleInputTagChange}
                placeholder="输入标签"
                onPressEnter={handleAddTag}
              />
              <Button onClick={handleAddTag}>添加标签</Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Tag key={tag} closable onClose={() => handleRemoveTag(tag)}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              更新笔记
            </Button>
          </Form.Item>
        </Form> */}
      </div>
    </>
  );
};

export default EditNote;
