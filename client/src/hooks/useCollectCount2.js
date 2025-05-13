import { useState, useEffect } from 'react';
import { getCollectCount } from '@/api/homeApi';
import { useStore } from '@/store/userStore';

export const useCollectCount = () => {
  const [count, setCount] = useState(0);
  const { user } = useStore();
  
  useEffect(() => {
    const fetchCollectCount = async () => {
      try {
        const response = await getCollectCount(user.id);
        setCount(response.data?.total_collections || 0);
      } catch (error) {
        console.error('Failed to fetch like count:', error);
      }
    };
    fetchCollectCount();
  }, [user.id]);
  return count;
};
