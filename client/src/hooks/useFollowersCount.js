import { getUserFollowers } from '@/api/communityApi';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const useFollowersCount = () => {
  const [count, setCount] = useState(0);
  const { personalId } = useParams();

  useEffect(() => {
    const fetchFollowersCount = async () => {
      try {
        const response = await getUserFollowers(personalId);
        setCount(response.data.length);
      } catch (error) {
        console.error('Failed to fetch fellowers count:', error);
      }
    };
    fetchFollowersCount();
  }, [personalId]);
  return count;
};
