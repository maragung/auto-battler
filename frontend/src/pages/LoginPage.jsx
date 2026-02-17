import { useState } from 'react'
import { useAuthStore } from '../stores'
import { authAPI } from '../utils/api'
import styles from './LoginPage.module.css'

export default function LoginPage({ onSuccess, onSwitchPage }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setToken } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await authAPI.login(email, password)
      const { user, token } = res.data
      setUser(user)
      setToken(token)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>⚔️ Auto Battler</h1>
          <p className={styles.subtitle}>3D Auto Chess PvP</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitBtn} btn-primary`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className={styles.divider}>or</div>

          <button
            onClick={onSwitchPage}
            className={styles.switchBtn}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  )
}
