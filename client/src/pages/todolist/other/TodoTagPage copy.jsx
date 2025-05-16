// 只有创建待办项版本
import React, { useState, useEffect } from 'react';
import { Layout, Badge, Calendar, Input, message } from 'antd';
import Navbar from '@/components/Navbar';
import { getTodoLists, createTodoList } from '@/api/todoListApi';
import { useStore } from '@/store/userStore';
import TodoListManager from '@/components/TodoListManage';
import './Todolist.css';

const TodoList = () => {
  const { Content } = Layout;
  const [todoList, setTodoList] = useState([]);
  const { user } = useStore();
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchTodoListData();
  }, [user]);

  // 获取待办项列表
  const fetchTodoListData = async () => {
    try {
      const fetchedTodoList = await getTodoLists(user.id);
      setTodoList(fetchedTodoList.data);
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
    </Layout>
  );
};

export default TodoList;
