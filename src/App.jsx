import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Preloader from './components/Preloader'
import { BottomNav } from './components/Layout'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Forum from './pages/Forum'
import Profile from './pages/Profile'
import PracticeType from './pages/PracticeType'
import SelectSubjects from './pages/SelectSubjects'
import PrepareExam from './pages/PrepareExam'
import Exam from './pages/Exam'
import Results from './pages/Results'
import Activate from './pages/Activate'

const NAV_ROUTES = ['/', '/forum', '/profile']

export default function App() {
  const { session, loading } = useAuth()
  const [splash, setSplash] = useState(true)
  const { pathname } = useLocation()

  useEffect(() => { const t = setTimeout(() => setSplash(false), 1800); return () => clearTimeout(t) }, [])

  if (splash || loading) return <Preloader />

  return (
    <div className="shell">
      {!session ? <Auth /> : (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/practice" element={<PracticeType />} />
            <Route path="/subjects" element={<SelectSubjects />} />
            <Route path="/prepare" element={<PrepareExam />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/results" element={<Results />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {NAV_ROUTES.includes(pathname) && <BottomNav />}
        </>
      )}
    </div>
  )
}
