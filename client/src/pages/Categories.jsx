import React, { useState, useEffect } from 'react';
import { List, Card } from 'antd';
import { getCategories } from '@/api/categoryApi';
import { useStore } from '@/store/userstore';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Categories = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  // 目前所有需要登录的页面，就是使用 useEffect 副作用 Hook，
  // 是否有 user 信息，来跳转到 login 页面，只执行一次。
  // 不加这个的页面就不需要登录，比如 Home 页面。
  // 当然，也有其他方法，可以思考，比如拦截器中实现。
  // 来根据 store 中
  useEffect(() => {
    if (!user) navigate('/login');
  }, [navigate, user]);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 定义一个异步函数 fetchCategoriesData 用于获取分类数据
    const fetchCategoriesData = async () => {
      try {
        const fetchedCategories = await getCategories();
        console.log('Fetched categories:', fetchedCategories.data);
        setCategories(fetchedCategories.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        alert('获取分类失败');
      }
    };
    fetchCategoriesData();
  }, []);

  return (
    <>
      <Navbar />
      <div>
        <h1>分类列表</h1>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={categories}
          renderItem={(item) => (
            <Card hoverable className="m-2">
              <Card.Meta title={item.name} />
              {/* 修改 href 属性，包含 userId */}
              <a href={`/notes/categories/${user.id}/${item.id}`}>
                查看分类笔记
              </a>
            </Card>
          )}
        />
      </div>
    </>
  );
};
export default Categories;
