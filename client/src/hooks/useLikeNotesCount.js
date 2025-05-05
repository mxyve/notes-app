// 卡片中显示的数

import { useState, useEffect } from 'react';
import { getLikeNote } from '@/api/homeApi';
import { useStore } from '@/store/userStore';

export const useLikeNotesCount = () => {
  const { user } = useStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchLikeNotesCount = async () => {
      try {
        const response = await getLikeNote(user.id);
        setCount(response.data?.length || 0);
      } catch (error) {
        console.error('Failed to fetch like notes count:', error);
      }
    };
    fetchLikeNotesCount();
  }, [user.id]);
  return count;
};
