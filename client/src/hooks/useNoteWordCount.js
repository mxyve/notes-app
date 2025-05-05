import { useState, useEffect } from 'react';
import { getNotes } from '@/api/noteApi';
import { useStore } from '@/store/userStore';

export const useNoteWordCount = () => {
  const { user } = useStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchNoteWordCount = async () => {
      try {
        const response = await getNotes(user.id, 0);
        // 计算所有笔记的 word_count 总和
        const totalWordCount = response.data.reduce((sum, note) => {
          return sum + (note.word_count || 0);
        }, 0);
        setCount(totalWordCount);
      } catch (error) {
        console.error('Failed to fetch like notes count:', error);
      }
    };
    fetchNoteWordCount();
  }, [user.id]);
  return count;
};
