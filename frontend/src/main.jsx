// 시작점: index.html 의 <div id="root"> 안에 App 을 그려요.
// BrowserRouter 가 있어야 /posts/p-1 같은 주소로 화면을 바꿀 수 있어요.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
