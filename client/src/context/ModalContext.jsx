// 全局状态管理
import { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [ocrModalVisible, setOcrModalVisible] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        chatModalVisible,
        setChatModalVisible,
        ocrModalVisible,
        setOcrModalVisible,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
