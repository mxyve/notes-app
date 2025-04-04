import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Tag, Select, message } from 'antd';
import { getCategories } from '@/api/categoryApi';

// 笔记表单组件
const NoteForm = ({
  initialValues = {}, // 表单初始值，默认为空对象
  onSubmit, // 表单提交时的回调函数
  submitButtonText, // 提交按钮的⽂本
  form, // Ant Design Form 实例，⽤于表单管理
}) => {
  const [tags, setTags] = useState(initialValues.tags || []); // 标签状态，初始值为传⼊的initialValues.tags 或空数组
  const [inputTag, setInputTag] = useState(''); // 输⼊框中的标签内容，初始为空字符串
  const [categories, setCategories] = useState([]); // 分类状态，初始为空数组

  console.log('initialValues:', initialValues);

  console.log('initialValues.tags', initialValues.tags);

  // 使⽤useEffect 钩⼦在组件加载时获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories(); // 调⽤API 获取分类数据
        setCategories(response.data); // 将获取到的分类数据存储到状态中
        console.log('获取分类：', response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        message.error('获取分类失败');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setTags(initialValues.tags || []);
  }, [initialValues.tags]);

  // 表单提交时的处理函数
  const handleSubmit = async (values) => {
    onSubmit({ ...values, tags }); // 调⽤⽗组件传⼊的onSubmit 回调函数，传⼊表单值和标签
  };

  // 输⼊框内容变化时的处理函数
  const handleInputTagChange = (e) => {
    setInputTag(e.target.value); // 更新输⼊框中的标签内容
  };

  // 添加标签的处理函数
  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      // 如果输⼊框中有内容且标签未重复
      setTags([...tags, inputTag]); // 将新标签添加到标签列表中
      setInputTag(''); // 清空输⼊框
    }
  };

  // 删除标签的处理函数
  const handleRemoveTag = (removedTag) => {
    const newTags = tags.filter((tag) => tag !== removedTag); // 过滤掉要删除的标签
    setTags(newTags); // 更新标签列表
  };

  // 渲染组件
  return (
    <Form
      form={form} // 绑定Ant Design Form 实例
      onFinish={handleSubmit} // 表单提交时调⽤handleSubmit 函数
      layout="vertical" // 表单布局为垂直
      className="max-w-2xl mx-auto" // 样式：最⼤宽度为2xl，居中
      initialValues={initialValues} // 设置表单初始值
    >
      {/* 标题输⼊框*/}
      <Form.Item
        label="标题" // 标签⽂本
        name="title" // 表单字段名称
        rules={[{ required: true, message: '请输⼊笔记标题' }]} // 验证规则：标题必填
      >
        <Input placeholder="请输⼊笔记标题 " />
      </Form.Item>
      {/* 内容输⼊框*/}
      <Form.Item
        label="内容" // 标签⽂本
        name="content" // 表单字段名称
        rules={[{ required: true, message: '请输⼊笔记内容' }]} // 验证规则：内容必填
      >
        <Input.TextArea rows={6} placeholder="请输⼊笔记内容" />
      </Form.Item>
      {/* 分类选择框*/}
      <Form.Item
        label="类型" // 标签⽂本
        name="categoryId" // 表单字段名称
        rules={[{ required: true, message: '请选择笔记类型 ' }]} // 验证规则：分类必选
      >
        <Select placeholder="请选择笔记类型">
          {categories.map(
            (
              category, // 遍历分类数据
            ) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ),
          )}
        </Select>
      </Form.Item>
      {/* 标签输⼊和显示区域*/}
      <div className="mb-4">
        <label className="block mb-2">标签</label>
        <div className="flex gap-2 mb-2">
          <Input
            value={inputTag} // 绑定输⼊框值
            onChange={handleInputTagChange} // 输⼊框内容变化时调⽤handleInputTagChange 函数
            placeholder="输⼊标签" // 输⼊框占位符
            onPressEnter={handleAddTag} // 按下回⻋键时调⽤handleAddTag 函数
          />
          {/* 点击按钮时调⽤handleAddTag 函数*/}
          <Button onClick={handleAddTag}>添加标签</Button>{' '}
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* 遍历标签列表 */}
          {tags.map((tag) => (
            <Tag key={tag} closable onClose={() => handleRemoveTag(tag)}>
              {tag}
            </Tag>
          ))}
        </div>
      </div>
      {/* 提交按钮*/}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {/* 提交按钮的⽂本，由⽗组件传⼊*/}
          {submitButtonText}
        </Button>
      </Form.Item>
    </Form>
  );
};
export default NoteForm;
