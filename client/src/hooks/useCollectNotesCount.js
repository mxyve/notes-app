import { useState, useEffect } from 'react';
import { getCollectNote } from '@/api/homeApi';
import { useStore } from '@/store/userStore';

export const useCollectNotesCount = () => {
  const { user } = useStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCollectNotesCount = async () => {
      try {
        const response = await getCollectNote(user.id);
        setCount(response.data?.length || 0);
      } catch (error) {
        console.error('Failed to fetch collect notes count:', error);
      }
    };
    fetchCollectNotesCount();
  }, [user.id]);
  return count;
};
