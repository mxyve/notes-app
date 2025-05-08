import { useState, useEffect } from 'react';
import { getCollectCount } from '@/api/homeApi';
import { useStore } from '@/store/userStore';
import { useParams } from 'react-router-dom';

export const useCollectCount = () => {
  const { user } = useStore();
  const [count, setCount] = useState(0);
  const { personalId } = useParams();

  useEffect(() => {
    const fetchCollectCount = async () => {
      try {
        const response = await getCollectCount(personalId);
        console.log('response=-=-=-=-=-=', response.data);
        setCount(response.data?.total_collections || 0);
      } catch (error) {
        console.error('Failed to fetch like count:', error);
      }
    };
    fetchCollectCount();
  }, [personalId]);
  return count;
};
