import { useState, useEffect } from 'react';
import { getLikeCount } from '@/api/homeApi';
import { useStore } from '@/store/userStore';

export const useLikeCount = () => {
  const [count, setCount] = useState(0);
  const { user } = useStore();

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const response = await getLikeCount(user.id);
        setCount(response.data?.total_likes || 0);
      } catch (error) {
        console.error('Failed to fetch like count:', error);
      }
    };
    fetchLikeCount();
  }, [user.id]);
  return count;
};
