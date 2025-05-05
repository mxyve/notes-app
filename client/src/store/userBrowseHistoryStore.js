import { create } from 'zustand';
import { useEffect } from 'react';

// 定义浏览记录 store
const useBrowseHistoryStore = create((set) => ({
  browseHistory: [],
  addToHistory: (noteId, noteTitle, userId) => {
    set((state) => {
      const newHistory = [
        ...state.browseHistory,
        { noteId, noteTitle, timestamp: new Date().getTime(), userId },
      ];
      // 确保记录数量不超过十条
      if (newHistory.length > 10) {
        newHistory.shift();
      }
      return { browseHistory: newHistory };
    });
  },
  getBrowseHistory: () => ({
    browseHistory: (state) => state.browseHistory,
  }),
}));

export const usePersistentBrowseHistoryStore = (userId) => {
  const { browseHistory, addToHistory } = useBrowseHistoryStore();

  // 从 localStorage 中读取历史记录并初始化状态
  useEffect(() => {
    // 使用 browseHistory_${userId} 作为键来存储和读取浏览记录
    const history = localStorage.getItem(`browseHistory_${userId}`);
    if (history) {
      useBrowseHistoryStore.setState({
        browseHistory: JSON.parse(history),
      });
    }
  }, [userId]);

  // 在状态发生变化时，将更新后的历史记录保存到 localStorage 中
  useEffect(() => {
    localStorage.setItem(
      `browseHistory_${userId}`,
      JSON.stringify(browseHistory),
    );
  }, [browseHistory, userId]);

  return { browseHistory, addToHistory };
};

export default usePersistentBrowseHistoryStore;
