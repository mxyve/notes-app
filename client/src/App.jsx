import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '@/routes';
import { ModalProvider } from '@/context/ModalContext';

const App = () => {
  return (
    <Router>
      <ModalProvider>
        <AppRoutes />
      </ModalProvider>
    </Router>
  );
};

export default App;
