import { create } from 'zustand';
import { useEffect } from 'react';

// 定义浏览记录 store
const useBrowseHistoryStore = create((set) => ({
  browseHistory: [],
  addToHistory: (noteId, noteTitle, userId) => {
    set((state) => {
      // 过滤掉已有的相同的 noteId 的记录
      const filteredHistory = state.browseHistory.filter(
        (historyItem) => historyItem.noteId !== noteId,
      );
      // 添加新记录（确保是最新的）
      const newHistory = [
        ...filteredHistory,
        { noteId, noteTitle, timestamp: new Date().getTime(), userId },
      ].slice(-10); // 直接截取最后 10 条（替代 if 判断）
      // // 确保记录数量不超过十条
      // if (newHistory.length > 10) {
      //   newHistory.shift();
      // }
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
