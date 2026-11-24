// 앱의 뼈대: 어떤 주소에서 어떤 화면을 보여 줄지 정해요.
// 모든 화면에 상단바(Navbar), 숯색 마무리(Footer), 시연 순서 바(DemoBar), 새 글 알림(NewPostAlert)이 붙어요.
import { useEffect, useRef } from 'react'
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import DemoBar from './components/layout/DemoBar'
import NewPostAlert from './components/layout/NewPostAlert'
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
import { MeProvider, useMe } from './context/MeContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { authRedirect } from './lib/supabase'

// 다른 화면으로 넘어가면 맨 위부터 보여 줘요 (주소에 #위치가 붙은 경우는 빼고)
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => { if (!hash) window.scrollTo(0, 0) }, [pathname, hash])
  return null
}

// 인증 메일 링크를 눌러 돌아왔을 때: 성공이면 안내 후 홈으로, 만료·실패면 로그인 화면으로
function AuthRedirectNotice() {
  const { isGuest } = useMe()
  const toast = useToast()
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (!authRedirect || handled.current) return
    if (!authRedirect.ok) {
      handled.current = true
      toast(authRedirect.code === 'otp_expired'
        ? '인증 링크가 만료됐어요. 로그인 화면에서 인증 메일을 다시 받아 주세요'
        : '이메일 인증에 실패했어요. 다시 시도해 주세요')
      navigate('/login', { replace: true })
    } else if (!isGuest) {
      handled.current = true
      toast(authRedirect.type === 'signup' ? '이메일 인증이 끝났어요. 환영해요!' : '로그인했어요')
      navigate('/', { replace: true })
    }
  }, [isGuest, toast, navigate])
  return null
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <AuthRedirectNotice />
      <Navbar />
      <main><Outlet /></main>
      <Footer />
      <DemoBar />
      <NewPostAlert />
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
