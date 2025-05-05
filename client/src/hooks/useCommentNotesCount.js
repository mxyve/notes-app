import { useState, useEffect } from 'react';
import { getMyComments } from '@/api/homeApi';
import { useStore } from '@/store/userStore';

export const useCommentNotesCount = () => {
  const { user } = useStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCommnetNotesCount = async () => {
      try {
        const response = await getMyComments(user.id);
        setCount(response.data?.length || 0);
      } catch (error) {
        console.error('Failed to fetch like notes count:', error);
      }
    };
    fetchCommnetNotesCount();
  }, [user.id]);
  return count;
};
