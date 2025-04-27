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
} from 'antd';
import Navbar from '@/components/Navbar';
import TodoDetail from '@/components/todoDetail';
import { getTodoLists, getTodoList, updateTodoList } from '@/api/todoListApi';
import { useStore } from '@/store/userStore';
import RichTextEditor from '@/components/RichTextEditor';

// 按日期分组待办事项,同时考虑年、月、日
const groupTodoListByDate = (todoList) => {
  const grouped = {};
  todoList.forEach((todo) => {
    const date = new Date(todo.created_at);
    console.log('date', date); // Thu Apr 10 2025 13:09:56 GMT+0800 (中国标准时间)
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const key = `${year}-${month}-${day}`;
    console.log('key', key);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    console.log('grouped[key]', grouped[key]);
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

  const [isclick, SetIsClick] = useState();
  const [todoList, setTodoList] = useState();
  const [groupedTodoList, setGroupedTodoList] = useState({});
  const { user } = useStore();

  const [open, setOpen] = useState(false);
  const [size, setSize] = useState();
  const [todoListDetail, setTodoListDetail] = useState();
  const [title, setTitle] = useState();
  const [content, setContent] = useState();
  const [tags, setTags] = useState();

  // console.log('User ID:', user.id);
  // 获取待办项列表
  const fetchTodoListData = async () => {
    try {
      const fetchedTodoList = await getTodoLists(user.id);
      console.log('fetchedTodoList', fetchedTodoList.data);
      setTodoList(fetchedTodoList.data);
      const grouped = groupTodoListByDate(fetchedTodoList.data);
      setGroupedTodoList(grouped);
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
      setTags(fetchedTodoListDetail.data.tags);
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
        tags,
        userId: user.id,
      };
      await updateTodoList(id, updateTodoListData);
      message.success('待办项更新成功');
    } catch (error) {
      console.error('Failed to update todoList:', error);
      message.error('更新待办项失败');
    }
  };

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
    setOpen(false);
  };

  return (
    <div>
      <Layout>
        <Navbar />
        <Content>
          <Input placeholder="Basic usage" />
          <Calendar cellRender={cellRender} />
          <Drawer
            title={`${size} Drawer`}
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
              <div>
                <label>标题</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                ></Input>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                ></Input>
                <RichTextEditor
                  value={content}
                  onChange={(newContent) => setContent(newContent)}
                ></RichTextEditor>
                <Button
                  type="primary"
                  onClick={() => handleSubmit(todoListDetail.id)}
                >
                  更新
                </Button>
              </div>
            )}
          </Drawer>
        </Content>
        {/* <TodoDetail style={{ width: '300px' }} /> */}
      </Layout>
    </div>
  );
};

export default TodoList;
