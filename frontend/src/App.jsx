import { useEffect, useState } from 'react'
import { useAuthStore } from './stores'
import { authAPI } from './utils/api'
import websocket from './utils/websocket'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import BattlePage from './pages/BattlePage'
import styles from './App.module.css'

export default function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const { user, token, setUser, setToken } = useAuthStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    if (token) {
      authAPI.getCurrentUser()
        .then(res => {
          setUser(res.data)
          setCurrentPage('dashboard')
          // Connect WebSocket
          websocket.connect(token).catch(err => console.error('WS connection failed:', err))
        })
        .catch(err => {
          console.error('Failed to validate token:', err)
          setToken(null)
          setCurrentPage('login')
        })
        .finally(() => setIsCheckingAuth(false))
    } else {
      setIsCheckingAuth(false)
    }

    return () => {
      websocket.disconnect()
    }
  }, [token])

  if (isCheckingAuth) {
    return <div className={styles.loading}>Loading...</div>
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onSuccess={() => setCurrentPage('dashboard')} onSwitchPage={() => setCurrentPage('register')} />
      case 'register':
        return <RegisterPage onSuccess={() => setCurrentPage('dashboard')} onSwitchPage={() => setCurrentPage('login')} />
      case 'dashboard':
        return <Dashboard onBattle={() => setCurrentPage('battle')} />
      case 'battle':
        return <BattlePage onBack={() => setCurrentPage('dashboard')} />
      default:
        return <LoginPage onSuccess={() => setCurrentPage('dashboard')} onSwitchPage={() => setCurrentPage('register')} />
    }
  }

  return (
    <div className={styles.app}>
      {renderPage()}
    </div>
  )
}
