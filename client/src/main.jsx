import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'virtual:uno.css';
import '@ant-design/v5-patch-for-react-19';
// import 'global';

// // 手动定义全局对象变量
// const _global =
//   typeof global !== 'undefined'
//     ? global
//     : typeof window !== 'undefined'
//       ? window
//       : {};

// import global from 'global';
// // 手动定义 global 对象
// if (typeof global === 'undefined') {
//   global = window;
// }

createRoot(document.getElementById('root')).render(<App />);
