import React, { useState, useEffect } from 'react';
import { Drawer, Button, Space, message, Modal, Select, Input } from 'antd';
import { RestOutlined, PlusOutlined } from '@ant-design/icons';
import {
  getTodoList,
  updateTodoList,
  createTodoList,
  deleteTodoList,
  getTags,
  createTag,
} from '@/api/todoListApi';
import RichTextEditor from '@/components/RichTextEditor';
import Rili from '@/components/Rili';

const TodoListManage = ({
  user,
  selectedTodoId,
  onTodoUpdated,
  onCreateTodo,
  onDrawerClose,
}) => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState('');
  const [todoListDetail, setTodoListDetail] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [tagId, setTagId] = useState('');
  const [tagsList, setTagsList] = useState([]);
  const [time, setTime] = useState('');
  const [showRili, setShowRili] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);

  // 监听 selectedTodoId 变化，获取待办事项详情
  useEffect(() => {
    if (selectedTodoId) {
      fetchTodoListDetail(selectedTodoId);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [selectedTodoId]);

  const onClose = () => {
    setOpen(false);
    setTitle('');
    setContent('');
    setTags('');
    setTagId('');
    // 调用父组件的回调函数来重置 selectedTodoId
    if (onDrawerClose) onDrawerClose();
  };

  // 获取单个待办项
  const fetchTodoListDetail = async (id) => {
    try {
      const fetchedTodoListDetail = await getTodoList(id);
      setTodoListDetail(fetchedTodoListDetail.data);
      setTitle(fetchedTodoListDetail.data.title);
      setContent(fetchedTodoListDetail.data.content);
      setTags(fetchedTodoListDetail.data.tag_name);
      setTime(fetchedTodoListDetail.data.time);

      // 获取所有标签列表
      const tagData = await getTags(user.id);
      if (tagData.data) {
        setTagsList(
          tagData.data.map((tag) => ({
            label: tag.name,
            value: tag.id,
            name: tag.name,
          })),
        );

        // 设置当前标签id
        if (fetchedTodoListDetail.data.tag_id) {
          setTagId(fetchedTodoListDetail.data.tag_id);
        }
      } else {
        setTagsList([]);
        message.error('获取标签列表失败');
      }
    } catch (error) {
      alert('获取数据失败');
    }
  };

  // 更新待办项
  const handleSubmit = async () => {
    if (!todoListDetail) return;

    try {
      const updateTodoListData = {
        title,
        content,
        tagId: tagId || null,
        userId: user.id,
        time: time,
      };

      await updateTodoList(todoListDetail.id, updateTodoListData);
      message.success('待办项更新成功');

      // 刷新待办项列表
      if (onTodoUpdated) onTodoUpdated();

      // 关闭抽屉
      setOpen(false);
      if (onDrawerClose) onDrawerClose();
    } catch (error) {
      if (error.response) {
        console.error(
          'Server responded with status code:',
          error.response.status,
        );
        console.error('Response data:', error.response.data);
        message.error(`更新待办项失败，错误码: ${error.response.status}`);
      } else if (error.request) {
        console.error('No response received from the server');
        message.error('更新待办项失败，未收到服务器响应');
      } else {
        console.error('Error setting up the request:', error.message);
        message.error(`更新待办项失败，错误信息: ${error.message}`);
      }
    }
  };

  // 创建待办项（从抽屉中创建，保留原有功能）
  const handleCreateTodoFromDrawer = async () => {
    if (!title.trim()) {
      message.warning('请输入待办事项标题');
      return;
    }

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentTime = `${year}-${month}-${day}`;
      setTime(currentTime);

      const newTodoListData = {
        title,
        userId: user.id,
        time: currentTime,
      };

      const response = await createTodoList(newTodoListData);
      const newTodo = response.data;

      // 刷新待办项列表
      if (onTodoUpdated) onTodoUpdated();

      // 打开新创建的待办事项
      setTodoListDetail(newTodo);
      setTitle(newTodo.title);
      setOpen(true);
      setSize('large');

      // 调用回调函数
      if (onCreateTodo) onCreateTodo();
    } catch (error) {
      console.error('Error creating todo list:', error);
      message.error('创建待办项失败');
    }
  };

  // 删除待办项
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个待办项吗？',
      onOk: async () => {
        try {
          await deleteTodoList(id);
          message.success('删除成功');
          setOpen(false);

          // 刷新待办项列表
          if (onTodoUpdated) onTodoUpdated();
        } catch (error) {
          alert('删除数据失败');
        }
      },
      onCancel: () => {
        message.info('已取消删除');
      },
    });
  };

  // 创建标签
  const fetchCreateTag = async () => {
    try {
      if (!newTagName.trim()) {
        message.warning('请输入标签名称');
        return;
      }

      await createTag(user.id, { name: newTagName });

      message.success('标签创建成功');
      setIsTagModalVisible(false);
      setNewTagName('');

      // 刷新标签列表
      const tagData = await getTags(user.id);
      if (tagData.data) {
        setTagsList(
          tagData.data.map((tag) => ({
            label: tag.name,
            value: tag.id,
            name: tag.name,
          })),
        );
      }
    } catch (error) {
      console.error('创建标签失败:', error);
      message.error('创建标签失败');
    }
  };

  // 格式化日期函数
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const handleDateSelect = (selectedDate) => {
    const formattedDate = selectedDate.format('YYYY-MM-DD HH:mm:ss');
    setTime(formattedDate);
    setShowRili(false);
  };

  return (
    <div>
      <Drawer
        title={title || '新建待办事项'}
        placement="right"
        size="large"
        onClose={onClose}
        open={open}
        extra={
          <Space>
            <Button onClick={onClose}>取消</Button>
            {todoListDetail ? (
              <Button type="primary" onClick={handleSubmit}>
                更新
              </Button>
            ) : (
              <Button type="primary" onClick={handleCreateTodoFromDrawer}>
                创建
              </Button>
            )}
          </Space>
        }
      >
        {open && (
          <div>
            <label>标题</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            ></Input>

            {/* 标签 */}
            <Space>
              <Select
                value={tagId}
                options={tagsList}
                onChange={(value) => {
                  setTagId(value);
                  const selectedTag = tagsList.find(
                    (tag) => tag.value === value,
                  );
                  if (selectedTag) {
                    setTags(selectedTag.name);
                  }
                }}
                style={{ width: 200 }}
                placeholder="选择标签"
              >
                {tagsList.map((tag) => (
                  <Select.Option key={tag.value} value={tag.value}>
                    {tag.label}
                  </Select.Option>
                ))}
              </Select>

              <Button
                type="link"
                onClick={() => {
                  setIsTagModalVisible(true);
                  setNewTagName('');
                }}
              >
                <PlusOutlined />
                添加标签
              </Button>
            </Space>

            {/* 日历 */}
            <Button type="primary" onClick={() => setShowRili(true)}>
              {formatDate(time) || '选择日期'}
            </Button>
            {showRili && (
              <div className="rili-overlay">
                <Rili onDateSelect={handleDateSelect} />
              </div>
            )}

            {/* 富文本 */}
            <RichTextEditor
              value={content}
              onChange={(newContent) => setContent(newContent)}
            ></RichTextEditor>

            {/* 删除按钮 */}
            {todoListDetail && (
              <RestOutlined onClick={() => handleDelete(todoListDetail.id)} />
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title="添加标签"
        open={isTagModalVisible}
        onOk={fetchCreateTag}
        onCancel={() => {
          setIsTagModalVisible(false);
          setNewTagName('');
        }}
      >
        <Input
          placeholder="请输入标签名称"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default TodoListManage;
