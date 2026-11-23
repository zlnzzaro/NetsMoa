// 앱의 뼈대: 어떤 주소에서 어떤 화면을 보여 줄지 정해요.
// 모든 화면에 상단바(Navbar), 숯색 마무리(Footer), 시연 순서 바(DemoBar)가 붙어요.
import { useEffect } from 'react'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import DemoBar from './components/layout/DemoBar'
import HomePage from './pages/HomePage'
import BoardPage from './pages/BoardPage'
import PostDetailPage from './pages/PostDetailPage'
import WritePage from './pages/WritePage'
import ManagePage from './pages/ManagePage'
import TeamPage from './pages/TeamPage'
import MyPage from './pages/MyPage'
import MinePage from './pages/MinePage'
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound'
import { MeProvider } from './context/MeContext'
import { ToastProvider } from './context/ToastContext'

// 다른 화면으로 넘어가면 맨 위부터 보여 줘요 (주소에 #위치가 붙은 경우는 빼고)
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])
  return null
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main><Outlet /></main>
      <Footer />
      <DemoBar />
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <MeProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/write" element={<WritePage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/posts/:id/manage" element={<ManagePage />} />
            <Route path="/posts/:id/team" element={<TeamPage />} />
            <Route path="/me" element={<MyPage />} />
            <Route path="/mine" element={<MinePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </MeProvider>
    </ToastProvider>
  )
}
