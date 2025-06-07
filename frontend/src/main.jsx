import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 本番環境対応: polyfillsとデバッグヘルパーを初期化
import './utils/polyfills.js'
import './utils/prodDebugHelper.js'

console.log('🚀 アプリケーション初期化開始');
console.log('📍 実行環境:', process.env.NODE_ENV);
console.log('🌐 ブラウザ情報:', {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
