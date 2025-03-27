import { create } from 'zustand';

const userStore = create((set) => {
  // 从 localStorage 中读取用户信息
  const storedUser = localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user'))
    : null;

  return {
    user: storedUser,
    setUser: (user) => {
      set({ user });
      // 将用户信息存储到 localStorage
      localStorage.setItem('user', JSON.stringify(user));
    },
    logout: () => {
      set({ user: null });
      localStorage.removeItem('user');
    },
  };
});

export const useStore = userStore;
