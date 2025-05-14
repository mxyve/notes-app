import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useParams } from 'react-router-dom';
import {
  Layout,
  Card,
  Avatar,
  Divider,
  Tabs,
  List,
  Image,
  Typography,
  Button,
  Tooltip,
} from 'antd';
import { UserOutlined, EditOutlined, LikeOutlined } from '@ant-design/icons';
import { getUser } from '@/api/userApi';
import { getCategories } from '@/api/categoryApi';
import { getNotesByCategory } from '@/api/noteApi';
import dayjs from 'dayjs';
import { useLikeCount } from '@/hooks/useLikeCount';
import { useCollectCount } from '@/hooks/useCollectCount';
import { updateFollows, getFollowStatus } from '@/api/communityApi';
import { useStore } from '@/store/userStore';
import { useFollowersCount } from '@/hooks/useFollowersCount';
import GlobalModals from '@/components/GlobalModals';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const PersonalPage = () => {
  const { personalId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryIds, setCategoryIds] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const likeCount = useLikeCount();
  const collectCount = useCollectCount();
  const [isFlag, setIsFlag] = useState();
  const { user } = useStore();
  const followersCount = useFollowersCount();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUser(personalId);
        console.log('response.data', response.data);
        setUserData(response.data);
      } catch (error) {
        console.error('获取用户数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [personalId]);

  // 获取分类数据
  // 定义一个异步函数 fetchCategoriesData 用于获取分类数据
  const fetchCategoriesData = async () => {
    try {
      const fetchedCategories = await getCategories(personalId, 0);
      console.log('Fetched categories:', fetchedCategories.data);
      setCategories(fetchedCategories.data);
      const ids = fetchedCategories.data.map(
        (category) => category.category_id,
      );
      console.log('ids:', ids); // [1, 3, 4, 5]
      console.log('length', ids.length);
      setCategoryIds(ids);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('获取分类失败');
    }
  };
  useEffect(() => {
    fetchCategoriesData();
  }, [personalId]);

  // 获取分类的笔记  循环，用数组存, 希望得到有 categoryies id 和 title 的数组
  useEffect(() => {
    if (categoryIds.length > 0) {
      const fetchNotes = async () => {
        const allNotes = [];
        for (const categoryId of categoryIds) {
          try {
            const fetchedNotesData = await getNotesByCategory(
              personalId,
              categoryId,
              0,
              0,
            );
            console.log('分类' + categoryId + '的笔记', fetchedNotesData.data);
            const notes = fetchedNotesData.data.map((note) => ({
              id: note.id,
              categoryId,
              title: note.title,
              name: note.name,
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
      fetchNotes();
    }
  }, [categoryIds, personalId]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const response = await getFollowStatus(user.id, personalId);
        console.log('getStatus', response.data);
        setIsFlag(response.data.is_follow);
      } catch (error) {
        console.error('获取关注状态失败:', error);
      }
    };
    checkFollowStatus(); // 初始加载时检查关注状态
  }, [user.id, personalId]);

  const handleFollow = async () => {
    if (!user || !personalId) return;

    try {
      // 添加加载状态
      setLoading(true);
      // 等待请求完成
      const response = await updateFollows(user.id, personalId);
      // 确保在这里response已经完全接收
      console.log('更新后的状态:', response.data);
      // 使用回调方式确保状态更新基于最新值
      setIsFlag(response.data.is_flag);
    } catch (error) {
      console.error('关注操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Navbar />
        <Content className="p-4 max-w-4xl mx-auto w-full">加载中...</Content>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Navbar />
        <Content className="p-4 max-w-4xl mx-auto w-full">用户不存在</Content>
      </Layout>
    );
  }

  const filteredCategories = categories.filter((category) => {
    return notesList.some((note) => note.categoryId === category.category_id);
  });

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Navbar />
      <Content className="p-4 max-w-4xl mx-auto w-full">
        {/* 背景图与用户信息叠加 */}
        <div className="relative mb-6 rounded-lg overflow-hidden">
          {userData.backgroundImg ? (
            <Image
              src={userData.backgroundImg}
              alt="背景图"
              className="w-full h-21 object-cover"
              preview={false}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200"></div>
          )}

          {/* 叠加在背景图上的用户信息 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-end gap-4">
              <Avatar
                size={100}
                src={userData.avatar_url}
                icon={<UserOutlined />}
                className="border-2 border-white shadow-lg"
              />
              <div className="text-white">
                <Title level={3} className="!text-white !mb-1">
                  {userData.nickname ? userData.nickname : userData.username}
                </Title>
                <Text className="text-white/80 block mb-2">
                  {userData.signature && (
                    <Text className="text-white/90 italic">
                      {userData.signature}
                    </Text>
                  )}
                </Text>
                <Text className="text-white/80 block mb-2">
                  <Text className="text-white/90 italic">
                    邮箱：{userData.email}
                  </Text>
                </Text>
              </div>
            </div>
          </div>
        </div>

        <Button
          type={isFlag ? 'primary' : 'default'}
          icon={<LikeOutlined />}
          onClick={handleFollow} // 使用优化后的处理函数
          loading={loading} // 可以添加加载状态
        >
          {isFlag ? '已关注' : '关注'}
        </Button>
        {/* 用户数据统计 */}
        <Card className="w-full mb-6 rounded-lg shadow-sm">
          <div className="flex justify-around text-center">
            <div>
              <Title level={4} className="!mb-1">
                {likeCount}
              </Title>
              <Text type="secondary">获赞数</Text>
            </div>
            <div>
              <Title level={4} className="!mb-1">
                {collectCount}
              </Title>
              <Text type="secondary">收藏数</Text>
            </div>
            <div>
              <Title level={4} className="!mb-1">
                {followersCount}
              </Title>
              <Text type="secondary">粉丝数</Text>
            </div>
          </div>
        </Card>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={filteredCategories}
          renderItem={(item) => (
            <Card hoverable className="m-2">
              <Card.Meta title={item.name} />
              {/* 根据当前分类的id过滤出属于该分类的笔记数据 */}
              <List
                dataSource={notesList.filter(
                  (note) => note.categoryId === item.category_id,
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
            </Card>
          )}
        />
      </Content>
      <GlobalModals />
    </Layout>
  );
};

export default PersonalPage;
