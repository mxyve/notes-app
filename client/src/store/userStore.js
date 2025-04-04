import { create } from 'zustand';

// 使用 Zustand 库创建了一个简单的用户状态管理存储
// 用户信息的持久化存储（通过 localStorage）

const userStore = create((set) => {
  // 从 localStorage 中读取用户信息
  // localStorage 是浏览器提供的一个对象，用于在本地存储数据，数据会一直保留，除非手动删除。
  const storedUser = localStorage.getItem('user')
    ? // 反序列化
      JSON.parse(localStorage.getItem('user'))
    : null;

  return {
    user: storedUser,
    setUser: (user) => {
      set({ user });
      // 将用户信息以 JSON 字符串的形式存储到 localStorage
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: () => {
      set({ user: null });
      localStorage.removeItem('user');
    },
  };
});

// 将创建好的 userStore 导出为 useStore，
// 在其他组件中就可以通过导入 useStore 来使用这个状态存储，获取和修改用户信息。
export const useStore = userStore;
