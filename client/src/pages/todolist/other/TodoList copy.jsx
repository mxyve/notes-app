// 组件未复用版本
import React, { useState, useEffect } from 'react';
import {
  Layout,
  Badge,
  Calendar,
  Input,
  Drawer,
  Button,
  Space,
  message,
  Modal,
  Select,
} from 'antd';
import { RestOutlined, PlusOutlined } from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import {
  getTodoLists,
  getTodoList,
  updateTodoList,
  createTodoList,
  deleteTodoList,
  getTags,
  deleteTag,
  createTag,
} from '@/api/todoListApi';
import { useStore } from '@/store/userStore';
import RichTextEditor from '@/components/RichTextEditor';
import Rili from '@/components/Rili';
import './Todolist.css';

// 按日期分组待办事项,同时考虑年、月、日
const groupTodoListByDate = (todoList) => {
  const grouped = {};
  todoList.forEach((todo) => {
    const date = new Date(todo.time);
    // console.log('date', date); // Thu Apr 10 2025 13:09:56 GMT+0800 (中国标准时间)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const key = `${year}-${month}-${day}`;
    // console.log('key', key);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    // console.log('grouped[key]', grouped[key]);
    grouped[key].push({ type: 'success', content: todo.title, id: todo.id });
  });
  return grouped;
};

const getListData = (value, groupedTodoList) => {
  let listData = []; // Specify the type of listData
  const year = value.year();
  const month = value.month();
  const day = value.date();
  const key = `${year}-${month}-${day}`;

  // 添加从 API 获取的待办事项
  if (groupedTodoList[key]) {
    listData = [...groupedTodoList[key]];
  }

  // { type: 'warning', content: 'This is warning event.' },

  return listData || [];
};
const getMonthData = (value) => {
  if (value.month() === 8) {
    return 1394;
  }
};

const TodoList = () => {
  const { Content } = Layout;

  const [todoList, setTodoList] = useState();
  const [groupedTodoList, setGroupedTodoList] = useState({});
  const { user } = useStore();

  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  const [todoListDetail, setTodoListDetail] = useState();
  const [title, setTitle] = useState();
  const [newTitle, setNewTitle] = useState();
  const [content, setContent] = useState();
  const [tags, setTags] = useState('');
  const [tagId, setTagId] = useState(''); // 更新待办项
  const [tagsList, setTagsList] = useState([]);
  const [time, setTime] = useState();
  const [showRili, setShowRili] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);

  useEffect(() => {
    fetchTodoListData();
  }, [user]);

  const monthCellRender = (value) => {
    const num = getMonthData(value);
    return num ? (
      <div className="notes-month">
        <section>{num}</section>
        <span>Backlog number</span>
      </div>
    ) : null;
  };

  const dateCellRender = (value) => {
    const listData = getListData(value, groupedTodoList);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li
            key={item.content}
            onClick={() => {
              setSize('large');
              setOpen(true);
              fetchTodoListDetail(item.id); // 调用函数并传入待办项的 id
            }}
          >
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };
  const cellRender = (current, info) => {
    if (info.type === 'date') return dateCellRender(current);
    if (info.type === 'month') return monthCellRender(current);
    return info.originNode;
  };

  const onClose = () => {
    // 关闭抽屉
    setOpen(false);
    // 重置状态
    setTitle('');
    setContent('');
    setTags('');
    setTagId('');
  };

  // console.log('User ID:', user.id);
  // 获取待办项列表
  const fetchTodoListData = async () => {
    try {
      const fetchedTodoList = await getTodoLists(user.id);
      console.log('fetchedTodoList', fetchedTodoList.data);
      setTodoList(fetchedTodoList.data);
      const grouped = groupTodoListByDate(fetchedTodoList.data);
      console.log('grouped-=-=-=-=-=-', grouped);
      setGroupedTodoList(grouped);
      setNewTitle('');
    } catch (error) {
      alert('获取数据失败');
    }
  };
  useEffect(() => {
    fetchTodoListData();
  }, [user]);

  // 获取单个待办项
  const fetchTodoListDetail = async (id) => {
    try {
      const fetchedTodoListDetail = await getTodoList(id);
      setTodoListDetail(fetchedTodoListDetail.data);
      setTitle(fetchedTodoListDetail.data.title);
      setContent(fetchedTodoListDetail.data.content);
      setTags(fetchedTodoListDetail.data.tag_name);
      setTime(fetchedTodoListDetail.data.time);
      console.log(
        'fetchedTodoListDetail.data:\\\\\\\\\\\\\\\\\\\\\\\\',
        fetchedTodoListDetail.data,
      );
      // 获取所有标签列表
      const tagData = await getTags(user.id);
      console.log('tagData.data----------------------------', tagData.data);
      if (tagData.data) {
        setTagsList(
          tagData.data.map((tag) => ({
            label: tag.name,
            value: tag.id, // 使用标签ID作为value
            name: tag.name, // 保留标签名称用于显示
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
  const handleSubmit = async (id) => {
    try {
      const updateTodoListData = {
        title,
        content,
        tagId: tagId || null,
        userId: user.id,
        time: time,
      };
      console.log('time', time);
      await updateTodoList(id, updateTodoListData);
      message.success('待办项更新成功');
      // 刷新待办项列表
      fetchTodoListData();
      // 关闭抽屉
      setOpen(false);
      // 重置状态
      // setTitle('');
      // setContent('');
      // setTags('');
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

  // 创建待办项
  const fetchCreateTodoList = async () => {
    try {
      // 直接在创建 newTodoListData 对象时计算时间，而不是依赖 time 状态
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentTime = `${year}-${month}-${day}`;
      setTime(currentTime);
      const newTodoListData = {
        title: newTitle || '',
        userId: user.id,
        time: currentTime,
      };
      const response = await createTodoList(newTodoListData);
      // 假设 createTodoList 接口返回新创建的待办事项数据
      const newTodo = response.data;
      console.log('newTodo()()()()()', newTodo);
      // 刷新待办项列表
      fetchTodoListData();
      setOpen(true);
      setSize('large');
      setTodoListDetail(newTodo);
      setTitle(newTodo.title);
      // 重置状态
      setNewTitle('');
      setContent('');
      setTags('');
      // setTime('');
    } catch (error) {
      console.error('Error creating todo list:', error);
      message.error('创建待办项失败');
      setTitle('');
    }
  };

  // 删除待办项
  const fetchDeleteTodoList = async (id) => {
    try {
      await deleteTodoList(id);
      // 刷新待办项列表
      fetchTodoListData();
    } catch (error) {
      alert('删除数据失败');
    }
  };
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个待办项吗？',
      onOk: async () => {
        await fetchDeleteTodoList(id);
        message.success('删除成功');
        setOpen(false);
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

      await createTag(user.id, newTagName);

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
    console.log('formattedDate', formattedDate);
    setTime(formattedDate);
    setShowRili(false);
  };

  // 点击日历外面部分就不显示
  // const ref = React.useRef(null);

  // const handleClickOutside = (event) => {
  //   if (ref.current && !ref.current.contains(event.target)) {
  //     setShowRili(false);
  //   }
  // };

  // useEffect(() => {
  //   document.addEventListener('click', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('click', handleClickOutside);
  //   };
  // }, []);

  return (
    <div>
      <Layout>
        <Navbar />
        <Content>
          <Input
            placeholder="创建待办事项"
            onChange={(e) => setNewTitle(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault(); // 防止默认行为
              if (newTitle.trim() !== '') {
                fetchCreateTodoList();
              } else {
                message.warning('请输入待办事项标题');
              }
            }}
          />
          <Calendar cellRender={cellRender} />
          <Drawer
            title={title}
            placement="right"
            size={size}
            // 点击遮罩层或左上角叉或取消按钮的回调
            onClose={onClose}
            open={open}
            // 抽屉右上角的操作区域
            extra={
              <Space>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="primary" onClick={onClose}>
                  OK
                </Button>
              </Space>
            }
          >
            {todoListDetail && (
              // <div ref={ref}>
              <div>
                <label>标题</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                ></Input>
                {/* 标签 */}
                {/* tags 格式和 options 里的 value 格式一致 */}
                {/* defaultValue 只会在组件初次渲染时起作用，后续状态更新时不会自动更新。 */}
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
                      // 清空输入的标签名
                      setNewTagName('');
                    }}
                  >
                    <PlusOutlined />
                    添加标签
                  </Button>
                </Space>
                {/* 日历 */}
                <Button type="primary" onClick={() => setShowRili(true)}>
                  {formatDate(time)}
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
                {/* 更新 */}
                <Button
                  type="primary"
                  onClick={() => handleSubmit(todoListDetail.id)}
                >
                  更新
                </Button>
                <RestOutlined
                  onClick={() => {
                    if (todoListDetail) {
                      handleDelete(todoListDetail.id);
                    }
                  }}
                />
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
        </Content>
        {/* <TodoDetail style={{ width: '300px' }} /> */}
      </Layout>
    </div>
  );
};

export default TodoList;
