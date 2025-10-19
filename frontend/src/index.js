import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import volcanoAPI from './api/volcanoAPI';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';

// 在非 Electron 环境中，注入 volcanoAPI 到 window.electronAPI
if (!window.electronAPI) {
  window.electronAPI = volcanoAPI;
  console.log('🌐 Web 模式: 已注入 volcanoAPI 适配层');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

