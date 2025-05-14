// 组件复用版本
import React, { useState, useEffect } from 'react';
import { Layout, Badge, Calendar, Input, message } from 'antd';
import Navbar from '@/components/Navbar';
import { getTodoLists, createTodoList } from '@/api/todoListApi';
import { useStore } from '@/store/userStore';
import TodoListManager from '@/components/TodoListManage';
import './Todolist.css';
import GlobalModals from '@/components/GlobalModals';

// 按日期分组待办事项,同时考虑年、月、日
const groupTodoListByDate = (todoList) => {
  const grouped = {};
  todoList.forEach((todo) => {
    const date = new Date(todo.time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const key = `${year}-${month}-${day}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push({
      type: 'success',
      content: todo.title,
      id: todo.id,
      color: todo.tag_color,
    });
  });
  return grouped;
};

const getListData = (value, groupedTodoList) => {
  let listData = [];
  const year = value.year();
  const month = value.month();
  const day = value.date();
  const key = `${year}-${month}-${day}`;

  // 添加从 API 获取的待办事项
  if (groupedTodoList[key]) {
    listData = [...groupedTodoList[key]];
  }

  return listData || [];
};

const getMonthData = (value) => {
  if (value.month() === 8) {
    return 1394;
  }
};

const TodoList = ({ children }) => {
  const { Content } = Layout;
  const [todoList, setTodoList] = useState([]);
  const [groupedTodoList, setGroupedTodoList] = useState({});
  const { user } = useStore();
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

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

  // 创建颜色转换函数
  const getTransparentColor = (colorName) => {
    // Ant Design 颜色到 RGB 的映射
    const colorMap = {
      blue: '24, 144, 255',
      green: '52, 199, 89',
      red: '255, 77, 79',
      yellow: '250, 173, 20',
      orange: '255, 149, 0',
      cyan: '12, 183, 185',
      purple: '156, 39, 176',
      magenta: '255, 64, 129',
      volcano: '255, 109, 74',
      gold: '255, 193, 7',
      lime: '182, 230, 20',
      primary: '24, 144, 255', // 默认主色为蓝色
    };

    const rgb = colorMap[colorName] || '240, 240, 240'; // 默认灰色
    return `rgba(${rgb}, 0.6)`; // 添加透明度
  };

  const dateCellRender = (value) => {
    const listData = getListData(value, groupedTodoList);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li
            key={item.content}
            onClick={() => {
              setSelectedTodoId(item.id);
            }}
            className="transparent-item"
            style={{
              backgroundColor: getTransparentColor(item.color),
              // backgroundColor: item.color
              //   ? `${item.color}80` // 保持原颜色，添加 50% 透明度
              //   : '#f0f0f0', // 默认灰色，50% 透明度
              padding: '2px 4px',
              borderRadius: '2px',
              margin: '2px 0',
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

  // 获取待办项列表
  const fetchTodoListData = async () => {
    try {
      const fetchedTodoList = await getTodoLists(user.id);
      setTodoList(fetchedTodoList.data);
      console.log('fetchedTodoList.data', fetchedTodoList.data);
      const grouped = groupTodoListByDate(fetchedTodoList.data);
      setGroupedTodoList(grouped);
    } catch (error) {
      alert('获取数据失败');
    }
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
      };

      const response = await createTodoList(newTodoListData);
      const newTodo = response.data;

      // 重置输入框
      setNewTitle('');

      // 刷新待办项列表
      fetchTodoListData();

      // 显示新创建的待办事项
      setSelectedTodoId(newTodo.id);
    } catch (error) {
      console.error('Error creating todo list:', error);
      message.error('创建待办项失败');
    }
  };

  return (
    <Layout>
      <Navbar />
      <Content>
        <Input
          placeholder="创建待办事项"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onPressEnter={handleCreateTodo}
        />
        <Calendar cellRender={cellRender} />

        {/* 待办事项管理组件 */}
        <TodoListManager
          user={user}
          selectedTodoId={selectedTodoId}
          onTodoUpdated={fetchTodoListData}
          onCreateTodo={() => {
            // 这里可以处理创建新待办事项后的逻辑
          }}
          onDrawerClose={() => setSelectedTodoId(null)} // 回调，重置为null，这点点击同一个就可以变化值了
        />
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default TodoList;
