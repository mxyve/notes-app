// 分类列表

import React, { useState, useEffect } from 'react';
import { List, Card, Layout, Button, Modal, Input, message } from 'antd';
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '@/api/categoryApi'; // 获取所有分类，新建分类
import { getNotesByCategory } from '@/api/noteApi'; // 根据某个用户某个分类的所有笔记
import { useStore } from '@/store/userstore';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import dayjs from 'dayjs';

const Categories = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const { Content } = Layout;
  // 目前所有需要登录的页面，就是使用 useEffect 副作用 Hook，是否有 user 信息，来跳转到 login 页面，只执行一次。不加这个的页面就不需要登录，比如 Home 页面。当然，也有其他方法，可以思考，比如拦截器中实现。来根据 store 中
  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  const [categories, setCategories] = useState([]);
  const [notesList, setNotesList] = useState([]);
  // 使用 useState 来管理 categoryIds，这样状态更新时，依赖该状态的 useEffect 就会重新执行。
  // 如果 categoryIds 是一个普通的变量，而非状态。所以当 categoryIds 被更新时，依赖于它的 useEffect 不会重新执行。
  const [categoryIds, setCategoryIds] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);

  // 弹框
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    if (!name.trim()) {
      message.error('分类名称不能为空');
      return;
    }
    setIsModalOpen(false);
    try {
      // 改为对象形式
      const newCategoryData = { name };
      const fetchedCategory = await createCategory(newCategoryData); // 获取返回值
      // 更新分类列表
      setCategories((prevCategories) => [...prevCategories, fetchedCategory]);
      // 更新 categoryIds
      setCategoryIds((prevIds) => [...prevIds, fetchedCategory.id]);
      message.success('新增分类成功');
      // 新建分类成功后刷新页面
      window.location.reload();
    } catch (error) {
      console.error('Failed to update category:', error);
      message.error('更新分类失败');
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // 获取所有分类

  // 定义一个异步函数 fetchCategoriesData 用于获取分类数据
  const fetchCategoriesData = async () => {
    try {
      const fetchedCategories = await getCategories();
      console.log('Fetched categories:', fetchedCategories.data);
      setCategories(fetchedCategories.data);
      const ids = fetchedCategories.data.map((category) => category.id);
      console.log('ids:', ids); // [1, 3, 4, 5]
      console.log('length', ids.length);
      setCategoryIds(ids);
      setNotesList(ids);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('获取分类失败');
    }
  };
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  // 获取分类的笔记  循环，用数组存, 希望得到有 categoryies id 和 title 的数组
  const fetchNotes = async () => {
    if (!categoryIds || categoryIds.length === 0) return;
    console.log('length2', categoryIds.length);
    const allNotes = [];
    // 分类 id 循环
    for (const categoryId of categoryIds) {
      try {
        const fetchedNotesData = await getNotesByCategory(user.id, categoryId);
        console.log('分类' + categoryId + '的笔记', fetchedNotesData.data);
        // 把 分类id, 标题, 更新时间 存到 notes 数组
        const notes = fetchedNotesData.data.map((note) => ({
          id: note.id,
          categoryId,
          title: note.title,
          updatedAt: note.updated_at, // 注意字段名
        }));
        console.log(`分类${categoryId}处理后的笔记信息：`, notes);
        allNotes.push(...notes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        alert('获取笔记失败');
      }
    }
    console.log('allNotes:', allNotes);
    setNotesList(allNotes);
  };
  useEffect(() => {
    fetchNotes();
  }, [categoryIds, user.id]);

  return (
    <Layout>
      <Navbar />
      <Content>
        <div>
          <h1>分类列表</h1>

          <div>
            {/* 弹框 可以封装成组件，导航栏加入这个功能 */}
            <Button type="primary" onClick={showModal}>
              新建分类
            </Button>
            <Modal
              title="新建知识库"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <Input
                type="text"
                placeholder="请输入分类名称"
                onChange={(e) => setName(e.target.value)}
              />
            </Modal>
          </div>

          <Button type="primary" onClick={() => navigate('/create-note')}>
            创建笔记
          </Button>

          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={categories}
            renderItem={(item) => (
              <Card hoverable className="m-2">
                <Card.Meta title={item.name} />
                {/* 根据当前分类的id过滤出属于该分类的笔记数据 */}
                <List
                  dataSource={notesList.filter(
                    (note) => note.categoryId === item.id,
                  )}
                  renderItem={(note) => (
                    <a href={`/notes/${note.id}`}>
                      <List.Item>
                        {' '}
                        {/* 2025-04-09 16:58:41 */}
                        {note.title}------
                        {dayjs(note.updatedAt).format('YYYY/MM/DD')}
                      </List.Item>
                    </a>
                  )}
                />
                <a href={`/notes/categories/${item.id}`}>
                  {item.id}查看分类笔记
                </a>
                <Button
                  type="primary"
                  onClick={() => {
                    setModalVisible(true);
                    setSelectedCategoryId(item.id);
                  }}
                >
                  删除
                </Button>
              </Card>
            )}
          />
          <Modal
            title="确认删除"
            open={modalVisible}
            onOk={async () => {
              try {
                setLoading(true);
                await deleteCategory(selectedCategoryId);
                message.success('分类删除成功');
                fetchNotes();
                fetchCategoriesData();
              } catch (error) {
                console.error('Faild to delete note:', error);
                message.error('删除分类失败');
              } finally {
                setLoading(false);
                setModalVisible(false);
                setSelectedCategoryId(null);
              }
            }}
            onCancel={() => {
              setModalVisible(false);
              setSelectedCategoryId(null);
            }}
            confirmLoading={loading}
          >
            <p>确定删除吗</p>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};
export default Categories;
