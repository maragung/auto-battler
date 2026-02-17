import { useState } from 'react'
import { useAuthStore } from '../stores'
import { authAPI } from '../utils/api'
import { STARTER_CHARACTERS, RARITY_COLORS } from '../utils/characters'
import styles from './RegisterPage.module.css'

export default function RegisterPage({ onSuccess, onSwitchPage }) {
  const [step, setStep] = useState(1) // 1: form, 2: select characters
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [selectedCharacters, setSelectedCharacters] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, setToken } = useAuthStore()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCharacterSelect = (charId) => {
    setSelectedCharacters(prev => {
      if (prev.includes(charId)) {
        return prev.filter(id => id !== charId)
      } else if (prev.length < 5) {
        return [...prev, charId]
      }
      return prev
    })
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setStep(2)
  }

  const handleCharacterSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      const res = await authAPI.register(
        formData.username,
        formData.email,
        formData.password
      )
      const { user, token } = res.data
      setUser(user)
      setToken(token)
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
      setStep(1)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>⚔️ Create Account</h1>
          <p className={styles.subtitle}>Join Auto Battler</p>

          {step === 1 ? (
            <form onSubmit={handleFormSubmit} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="warrior_king"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className={`${styles.submitBtn} btn-primary`}>
                Next: Choose Characters
              </button>
            </form>
          ) : (
            <div className={styles.characterSelection}>
              <p className={styles.selectionHint}>
                Select 5 starter characters (bonus for new players)
              </p>
              <div className={styles.characterGrid}>
                {STARTER_CHARACTERS.map(char => (
                  <div
                    key={char.id}
                    className={`${styles.characterCard} ${selectedCharacters.includes(char.id) ? styles.selected : ''}`}
                    onClick={() => handleCharacterSelect(char.id)}
                    style={{
                      borderColor: RARITY_COLORS[char.rarity]
                    }}
                  >
                    <div className={styles.characterName}>{char.name}</div>
                    <div className={styles.characterClass}>{char.class}</div>
                    <div className={styles.characterStats}>
                      <span>❤️ {char.hp}</span>
                      <span>⚔️ {char.attack}</span>
                      <span>🛡️ {char.defense}</span>
                      <span>⚡ {char.speed}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.selectedCount}>
                {selectedCharacters.length} / 5 selected
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.buttonGroup}>
                <button
                  onClick={() => setStep(1)}
                  className={styles.backBtn}
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (selectedCharacters.length === 0) {
                      setError('Please select at least 1 character')
                      return
                    }
                    handleCharacterSubmit()
                  }}
                  disabled={isLoading}
                  className={`${styles.submitBtn} btn-primary`}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <>
              <div className={styles.divider}>or</div>
              <button onClick={onSwitchPage} className={styles.switchBtn}>
                Already have an account? Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
