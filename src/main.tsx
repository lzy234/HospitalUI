import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { initializeConfig } from './config'
import './styles/index.css'

// 初始化应用配置
try {
  initializeConfig();
} catch (error) {
  console.error('❌ 应用配置初始化失败:', error);
  // 在生产环境中，可以显示错误页面或者采取其他措施
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 