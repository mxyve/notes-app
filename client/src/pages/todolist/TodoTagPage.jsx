import React, { useState, useEffect } from 'react';
import {
  Layout,
  Input,
  message,
  Tag,
  Space,
  Modal,
  Button,
  Table,
  Form,
  Popconfirm,
  Select,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import {
  createTodoList,
  getTags,
  deleteTag,
  createTag,
  getTodoLists,
  updateTag,
} from '@/api/todoListApi';
import { useStore } from '@/store/userStore';
import TodoListManager from './components/TodoListManage';
import './Todolist.css';
import GlobalModals from '@/components/GlobalModals';

const TodoList = ({ children }) => {
  const { Content } = Layout;
  const { Option } = Select;
  const [todoList, setTodoList] = useState([]);
  const { user } = useStore();
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [tagsList, setTagsList] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isTagManageModalVisible, setIsTagManageModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm] = Form.useForm();

  useEffect(() => {
    fetchTodoListData();
    fetchTodoListTag();
  }, [user]);

  // 处理HTML内容，限制图片尺寸
  const processContent = (content) => {
    if (!content) return '无描述';

    // 创建一个临时元素来解析HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // 查找所有图片元素并设置固定尺寸
    const images = tempDiv.querySelectorAll('img');
    images.forEach((img) => {
      // 设置固定宽度和高度
      img.style.maxWidth = '100%'; // 确保图片不超出容器
      img.style.height = '150px'; // 固定高度
      img.style.objectFit = 'cover'; // 保持图片比例，裁剪超出部分
      img.style.borderRadius = '4px'; // 圆角
    });

    // 返回处理后的HTML字符串
    return tempDiv.innerHTML;
  };

  // 创建待办项
  const handleCreateTodo = async () => {
    if (!newTitle.trim()) {
      message.warning('请输入待办事项标题');
      return;
    }
    try {
      // 创建新待办事项
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentTime = `${year}-${month}-${day}`;
      const newTodoListData = {
        title: newTitle,
        userId: user.id,
        time: currentTime,
        tagId: selectedTagId, // 关联选中的标签
      };
      const response = await createTodoList(newTodoListData);
      const newTodo = response.data;
      // 重置输入框和标签选择
      setNewTitle('');
      setSelectedTagId(null);
      // 刷新待办项列表
      fetchTodoListData();
      // 显示新创建的待办事项
      setSelectedTodoId(newTodo.id);
    } catch (error) {
      console.error('Error creating todo list:', error);
      message.error('创建待办项失败');
    }
  };

  // 获取所有标签
  const fetchTodoListTag = async () => {
    try {
      // 获取所有标签列表，确保返回的标签数据包含color字段
      const tagData = await getTags(user.id);
      setTagsList(tagData.data || []);
    } catch (error) {
      console.error(error);
    }
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
      fetchTodoListTag();
    } catch (error) {
      console.error('创建标签失败:', error);
      message.error('创建标签失败');
    }
  };

  // 更新标签
  const handleUpdateTag = async (values) => {
    try {
      if (!editingTag) return;
      const { id } = editingTag;
      const { name, color } = values || editingTag; // 优先使用传入的values
      // console.log('Updating tag:', { id, name, color });
      if (!name.trim()) {
        message.warning('请输入标签名称');
        return;
      }
      await updateTag(id, { name, color });
      message.success('标签更新成功');
      setIsTagManageModalVisible(false);
      setEditingTag(null);
      // 刷新标签列表
      fetchTodoListTag();
    } catch (error) {
      console.error('更新标签失败:', error);
      message.error('更新标签失败');
    }
  };

  // 删除标签
  const handleDeleteTag = async (tagId) => {
    try {
      await deleteTag(tagId);
      message.success('标签删除成功');
      fetchTodoListData();
      fetchTodoListTag();
    } catch (error) {
      console.error('删除标签失败:', error);
      message.error('删除标签失败');
    }
  };

  // 选择标签
  const handleTagSelect = (tagId) => {
    setSelectedTagId((prevId) => {
      const newId = prevId === tagId ? null : tagId;
      fetchTodoListData(newId);
      return newId;
    });
  };

  // 获取待办项列表  接受参数而不是依赖状态
  const fetchTodoListData = async (tagId = selectedTagId) => {
    try {
      // 如果选择了标签，按标签筛选
      let fetchedTodoList;
      if (tagId === 'untagged') {
        // 获取所有待办事项然后前端过滤未标签的
        const response = await getTodoLists(user.id);
        setTodoList(response.data.filter((todo) => !todo.tag_id));
      } else if (tagId) {
        const response = await getTodoLists(user.id, tagId);
        setTodoList(response.data);
      } else {
        // 显示所有待办项
        console.log('selectedTagId', selectedTagId);
        const response = await getTodoLists(user.id);
        setTodoList(response.data);
      }
    } catch (error) {
      alert('获取数据失败');
    }
  };

  // 打开编辑标签
  const handleEditTag = (tag) => {
    setEditingTag({ ...tag });
    // 设置了表单初始值
    tagForm.setFieldsValue({
      name: tag.name,
      color: tag.color || 'blue',
    });
    setIsTagManageModalVisible(true);
  };

  // 打开标签管理模态框
  const handleOpenTagManageModal = () => {
    setIsTagManageModalVisible(true);
    setEditingTag(null);
    // tagForm.resetFields(); // 重置表单
    // 当执行 tagForm.resetFields() 时，如果对应的 <Form> 组件（编辑标签的表单）尚未挂载到 DOM（例如：打开标签管理模态框但未进入编辑模式时），tagForm 实例会处于 “未连接” 状态，此时调用其方法会触发错误。
    if (editingTag) {
      // 改：仅在编辑模式下重置（或根据实际逻辑调整）
      tagForm.resetFields();
    }
  };

  // 标签表格列配置
  const tagColumns = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tag color={record.color || 'blue'}>{text}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTag(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗?"
            onConfirm={() => handleDeleteTag(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Navbar />
      <Content className="p-6 bg-gray-50 min-h-screen">
        {/* 标签筛选器 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium">标签筛选</h3>
            <Button
              type="link"
              onClick={handleOpenTagManageModal}
              className="text-primary hover:text-primary/80"
            >
              管理标签
            </Button>
          </div>
          <Space wrap>
            <Tag
              color="default"
              onClick={() => handleTagSelect(null)}
              // className={selectedTagId === null ? 'bg-primary text-white' : ''}
            >
              全部
            </Tag>
            <Tag
              color="gray"
              onClick={() => handleTagSelect('untagged')}
              className={
                selectedTagId === 'untagged'
                  ? 'ring-2 ring-offset-2 ring-primary'
                  : ''
              }
            >
              其他
            </Tag>
            {tagsList.map((tag) => (
              <Tag
                key={tag.id}
                // 直接使用数据库中的color字段作为标签颜色
                color={tag.color || 'blue'} // 默认为蓝色，如果color字段不存在
                onClick={() => handleTagSelect(tag.id)}
                style={{
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  fontWeight: selectedTagId === tag.id ? 'bold' : 'normal',
                }}
                className={
                  selectedTagId === tag.id
                    ? 'ring-2 ring-offset-2 ring-primary'
                    : ''
                }
              >
                {tag.name}
              </Tag>
            ))}
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
        </div>

        {/* 创建待办事项输入框 */}
        <div className="mb-6">
          <Input
            placeholder="创建待办事项"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={handleCreateTodo}
            className="rounded-lg"
          />
        </div>

        {/* 待办事项列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {todoList
            .filter((todo) => !todo.tag_id)
            .map((todo) => (
              <div
                key={`untagged-${todo.id}`}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow border-l-4 border-gray-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">{todo.title}</h3>
                  <Tag color="default">其他</Tag>
                </div>
                {/* 其余内容保持不变 */}
                <p className="text-sm text-gray-600 mb-2">
                  {todo.content || '无描述'}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(todo.time).toLocaleDateString()}</span>
                  <button
                    onClick={() => setSelectedTodoId(todo.id)}
                    className="text-primary hover:text-primary/80"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            ))}

          {todoList.map((todo) => (
            <div
              key={todo.id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium">{todo.title}</h3>
                {todo.tag_name && (
                  <Tag
                    // 使用关联标签的颜色
                    color={
                      tagsList.find((t) => t.id === todo.tag_id)?.color ||
                      'blue'
                    }
                  >
                    {todo.tag_name}
                  </Tag>
                )}
              </div>
              <p
                className="text-sm text-gray-600 mb-2"
                // 解析HTML内容：使用 dangerouslySetInnerHTML 来解析HTML内容。
                style={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3, // 限制最多显示三行
                }}
                dangerouslySetInnerHTML={{
                  __html: processContent(todo.content),
                }}
              ></p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(todo.time).toLocaleDateString()}</span>
                <button
                  onClick={() => setSelectedTodoId(todo.id)}
                  className="text-primary hover:text-primary/80"
                >
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 待办事项管理组件 */}
        <TodoListManager
          user={user}
          selectedTodoId={selectedTodoId}
          onTodoUpdated={fetchTodoListData}
          onCreateTodo={() => {
            // 这里可以处理创建新待办事项后的逻辑
          }}
          onDrawerClose={() => setSelectedTodoId(null)}
          tagsList={tagsList} // 传递标签列表到管理组件
        />

        {/* 添加标签模态框 */}
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

        {/* 标签管理模态框 */}
        <Modal
          title={editingTag ? '编辑标签' : '标签管理'}
          open={isTagManageModalVisible}
          onOk={
            // 点了关闭不更新，直接关闭
            editingTag
              ? () => tagForm.submit()
              : () => setIsTagManageModalVisible(false)
          }
          onCancel={() => {
            setIsTagManageModalVisible(false);
            setEditingTag(null);
          }}
          okText={editingTag ? '保存' : '关闭'}
        >
          {editingTag ? (
            // 编辑标签表单
            <Form
              form={tagForm}
              name="tagForm"
              initialValues={{
                name: editingTag.name,
                color: editingTag.color || 'blue',
              }}
              onFinish={(values) => {
                setEditingTag({ ...editingTag, ...values });
                handleUpdateTag(values); // 直接使用表单的最新值进行更新
              }}
            >
              <Form.Item
                name="name"
                rules={[{ required: true, message: '请输入标签名称' }]}
              >
                <Input placeholder="请输入标签名称" />
              </Form.Item>
              <Form.Item
                name="color"
                label="标签颜色"
                rules={[{ required: true, message: '请选择标签颜色' }]}
              >
                <Select placeholder="请选择标签颜色">
                  {tagColors.map((color) => (
                    <Option key={color} value={color}>
                      <Tag color={color}>{color}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          ) : (
            // 标签列表
            <Table
              dataSource={tagsList}
              columns={tagColumns}
              rowKey="id"
              pagination={false}
            />
          )}
        </Modal>
      </Content>
      <GlobalModals />
    </Layout>
  );
};

// 可用的标签颜色
const tagColors = [
  'blue',
  'green',
  'red',
  'yellow',
  'orange',
  'cyan',
  'purple',
  'magenta',
  'volcano',
  'gold',
  'lime',
  'primary',
];

export default TodoList;
