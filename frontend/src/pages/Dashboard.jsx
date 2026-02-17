import { useEffect, useState } from 'react'
import { useAuthStore, useGameStore, useUIStore } from '../stores'
import { userAPI, matchAPI, battleAPI } from '../utils/api'
import websocket from '../utils/websocket'
import { RARITY_COLORS, CLASS_COLORS, getCharacterById } from '../utils/characters'
import styles from './Dashboard.module.css'

export default function Dashboard({ onBattle }) {
  const { user, setToken } = useAuthStore()
  const { characters, setCharacters, currentMatch, setCurrentMatch } = useGameStore()
  const { showNotif } = useUIStore()
  const [selectedChar, setSelectedChar] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allUnits, setAllUnits] = useState([])
  const [matches, setMatches] = useState([])

  useEffect(() => {
    loadInitialData()
    setupWebSocketListeners()

    return () => {
      websocket.on('match_created', null)
      websocket.on('match_updated', null)
    }
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      const [charsRes, unitsRes, matchesRes] = await Promise.all([
        userAPI.getCharacters(),
        battleAPI.getUnits(),
        matchAPI.getMatches()
      ])
      setCharacters(charsRes.data)
      setAllUnits(unitsRes.data)
      setMatches(matchesRes.data)
    } catch (err) {
      showNotif('Failed to load data: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const setupWebSocketListeners = () => {
    websocket.on('match_created', (data) => {
      setCurrentMatch(data)
      showNotif('Battle found! Preparing arena...', 'success')
    })

    websocket.on('match_updated', (data) => {
      setCurrentMatch(data)
    })
  }

  const handleAddCharacter = async (unitId) => {
    try {
      const res = await userAPI.addCharacter(unitId)
      setCharacters([...characters, res.data])
      showNotif('Character added!', 'success')
    } catch (err) {
      showNotif('Failed to add character: ' + err.message, 'error')
    }
  }

  const handleDeleteCharacter = async (characterId) => {
    if (!window.confirm('Remove this character?')) return
    try {
      setCharacters(characters.filter(c => c.id !== characterId))
      showNotif('Character removed', 'success')
    } catch (err) {
      showNotif('Failed to remove character: ' + err.message, 'error')
    }
  }

  const handleStartBattle = async () => {
    try {
      const res = await matchAPI.createMatch()
      setCurrentMatch(res.data)
      showNotif('Searching for opponent...', 'info')
      websocket.send('search_match', { userId: user.id })
    } catch (err) {
      showNotif('Failed to start battle: ' + err.message, 'error')
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard...</div>
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>⚔️ Dashboard</h1>
          <p className={styles.userName}>Welcome, {user?.username}!</p>
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={() => {
              setToken(null)
              window.location.reload()
            }}
            className={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.mainPanel}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Your Characters</h2>
              <span className={styles.count}>{characters.length}</span>
            </div>

            {characters.length === 0 ? (
              <div className={styles.empty}>
                <p>No characters yet. Add one from the shop!</p>
              </div>
            ) : (
              <div className={styles.characterList}>
                {characters.map(char => (
                  <div
                    key={char.id}
                    className={`${styles.charCard} ${selectedChar?.id === char.id ? styles.active : ''}`}
                    onClick={() => setSelectedChar(char)}
                    style={{ borderColor: RARITY_COLORS[char.rarity] }}
                  >
                    <h3>{char.name}</h3>
                    <p className={styles.charClass} style={{ color: CLASS_COLORS[char.class] }}>
                      {char.class}
                    </p>
                    <div className={styles.stats}>
                      <div>❤️ {char.hp}</div>
                      <div>⚔️ {char.attack}</div>
                      <div>🛡️ {char.defense}</div>
                      <div>⚡ {char.speed}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Battle Shop</h2>
            </div>
            <div className={styles.shopGrid}>
              {allUnits.map(unit => (
                <div key={unit.id} className={styles.shopCard}>
                  <h4>{unit.name}</h4>
                  <p>{unit.class}</p>
                  <div className={styles.shopStats}>
                    <small>HP: {unit.hp}</small>
                    <small>ATK: {unit.attack}</small>
                  </div>
                  <button
                    onClick={() => handleAddCharacter(unit.id)}
                    className="btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.battlePanel}>
            <h3>Multiplayer PvP</h3>
            {selectedChar ? (
              <div className={styles.selectedInfo}>
                <div className={styles.charPreview}>
                  <h4>{selectedChar.name}</h4>
                  <p>{selectedChar.class}</p>
                  <div className={styles.fullStats}>
                    <div>❤️ HP: {selectedChar.hp}</div>
                    <div>⚔️ Attack: {selectedChar.attack}</div>
                    <div>🛡️ Defense: {selectedChar.defense}</div>
                    <div>⚡ Speed: {selectedChar.speed}</div>
                  </div>
                </div>
                <button
                  onClick={handleStartBattle}
                  className={`${styles.battleBtn} btn-primary`}
                >
                  🎮 Start PvP Battle
                </button>
                <button
                  onClick={() => handleDeleteCharacter(selectedChar.id)}
                  className={styles.deleteBtn}
                >
                  🗑️ Remove Character
                </button>
              </div>
            ) : (
              <div className={styles.empty}>
                <p>Select a character to start battling!</p>
              </div>
            )}
          </div>

          <div className={styles.matchPanel}>
            <h3>Recent Matches</h3>
            {matches.length === 0 ? (
              <p className={styles.emptyText}>No matches yet</p>
            ) : (
              <div className={styles.matchList}>
                {matches.slice(0, 5).map(match => (
                  <div key={match.id} className={styles.matchItem}>
                    <div className={styles.matchTitle}>{match.player1} vs {match.player2}</div>
                    <div className={styles.matchResult}>
                      {match.winner === user?.id ? (
                        <span className={styles.win}>✓ Win</span>
                      ) : (
                        <span className={styles.loss}>✗ Loss</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
