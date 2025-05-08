import { useState, useEffect } from 'react';
import { getLikeCount } from '@/api/homeApi';
import { useParams } from 'react-router-dom';

export const useLikeCount = () => {
  const [count, setCount] = useState(0);
  const { personalId } = useParams();

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const response = await getLikeCount(personalId);
        setCount(response.data?.total_likes || 0);
      } catch (error) {
        console.error('Failed to fetch like count:', error);
      }
    };
    fetchLikeCount();
  }, [personalId]);
  return count;
};
