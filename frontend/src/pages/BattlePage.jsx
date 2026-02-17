import { useEffect, useState } from 'react'
import { useGameStore, useUIStore, useAuthStore } from '../stores'
import websocket from '../utils/websocket'
import { GRID_POSITIONS, POSITION_NAMES, getCharacterById, calculateDamage } from '../utils/characters'
import Dragon3DBattle from '../components/Dragon3D'
import BattleGrid from '../components/BattleGrid'
import BattleLog from '../components/BattleLog'
import styles from './BattlePage.module.css'

export default function BattlePage({ onBack }) {
  const { user } = useAuthStore()
  const { playerTeam, opponentTeam, gameState, battleLog, setGameState, addBattleLog, clearBoard } = useGameStore()
  const { showNotif } = useUIStore()
  const [availableUnits, setAvailableUnits] = useState([])
  const [selectedForPlacement, setSelectedForPlacement] = useState(null)
  const [battleResult, setBattleResult] = useState(null)
  const [opponent, setOpponent] = useState(null)

  useEffect(() => {
    setupWebSocketListeners()
    setGameState('setup')

    return () => {
      clearBoard()
    }
  }, [])

  const setupWebSocketListeners = () => {
    websocket.on('battle_start', (data) => {
      setOpponent(data.opponent)
      setGameState('playing')
      addBattleLog({
        type: 'info',
        message: `Battle started! vs ${data.opponent.username}`
      })
      simulateBattle()
    })

    websocket.on('battle_update', (data) => {
      addBattleLog({
        type: 'action',
        message: data.message
      })
    })

    websocket.on('battle_end', (data) => {
      setBattleResult(data)
      setGameState('finished')
      addBattleLog({
        type: 'finish',
        message: data.winner === user?.id ? 'You won! 🎉' : 'You lost! 💔'
      })
    })
  }

  const handlePlaceUnit = (position, unitId) => {
    if (playerTeam.length >= 3) {
      showNotif('Maximum 3 units per team', 'warning')
      return
    }

    const unit = getCharacterById(unitId)
    if (unit) {
      websocket.send('place_unit', {
        position,
        unitId,
        matchId: 'current-match-id'
      })
      showNotif(`${unit.name} placed at ${POSITION_NAMES[position]}`, 'success')
    }
  }

  const handleStartBattle = () => {
    if (playerTeam.length === 0) {
      showNotif('Please place at least 1 character', 'warning')
      return
    }

    websocket.send('start_battle', {
      team: playerTeam,
      matchId: 'current-match-id'
    })
    setGameState('playing')
  }

  const simulateBattle = () => {
    // Simple battle simulation
    let round = 1
    const log = []

    // Combat rounds
    while (playerTeam.length > 0 && opponentTeam.length > 0 && round <= 50) {
      // Player attacks
      const playerAttacker = playerTeam[Math.floor(Math.random() * playerTeam.length)]
      const opponentDefender = opponentTeam[Math.floor(Math.random() * opponentTeam.length)]

      const damage = calculateDamage(playerAttacker, opponentDefender)
      opponentDefender.currentHp = (opponentDefender.currentHp || opponentDefender.hp) - damage

      addBattleLog({
        type: 'action',
        message: `${playerAttacker.name} attacks ${opponentDefender.name} for ${damage} damage`
      })

      if (opponentDefender.currentHp <= 0) {
        addBattleLog({
          type: 'kill',
          message: `${opponentDefender.name} has been defeated!`
        })
      }

      round++
    }

    // Determine winner
    const playerWon = opponentTeam.length === 0
    setTimeout(() => {
      websocket.send('end_battle', {
        winner: playerWon ? user?.id : opponent?.id,
        matchId: 'current-match-id'
      })
    }, 1000)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backBtn}>← Back</button>
        <h1>⚔️ Battle Arena</h1>
        <div className={styles.status}>
          State: <span>{gameState}</span>
        </div>
      </header>

      <div className={styles.content}>
        <aside className={styles.leftPanel}>
          <h3>Available Units</h3>
          <div className={styles.unitList}>
            {[
              { id: 1, name: 'Flame Knight' },
              { id: 2, name: 'Frost Mage' },
              { id: 3, name: 'Shadow Rogue' },
              { id: 4, name: 'Holy Paladin' },
              { id: 5, name: 'Forest Ranger' }
            ].map(unit => (
              <div
                key={unit.id}
                className={styles.unit}
                onClick={() => setSelectedForPlacement(unit.id)}
              >
                {unit.name}
              </div>
            ))}
          </div>
        </aside>

        <div className={styles.battleArea}>
          {gameState === 'setup' ? (
            <div className={styles.gridContainer}>
              <div className={styles.gridSection}>
                <h3>Your Team</h3>
                <BattleGrid
                  isPlayer={true}
                  team={playerTeam}
                  onPlace={handlePlaceUnit}
                  selectedUnit={selectedForPlacement}
                />
                <p className={styles.teamSize}>{playerTeam.length}/3 Units</p>
              </div>

              <div className={styles.gridSection}>
                <h3>Opponent Team</h3>
                <BattleGrid
                  isPlayer={false}
                  team={opponentTeam}
                />
                <p className={styles.teamSize}>{opponentTeam.length}/3 Units</p>
              </div>
            </div>
          ) : (
            <div className={styles.dragonBattleContainer}>
              <Dragon3DBattle
                playerTeam={playerTeam}
                opponentTeam={opponentTeam}
              />
            </div>
          )}

          {gameState === 'setup' && (
            <button
              onClick={handleStartBattle}
              className={`${styles.startBtn} btn-primary`}
            >
              Start Battle
            </button>
          )}

          {gameState === 'finished' && battleResult && (
            <div className={styles.resultOverlay}>
              <div className={styles.resultCard}>
                <h2>{battleResult.winner === user?.id ? '🎉 Victory!' : '💔 Defeat'}</h2>
                <p>Match ID: {battleResult.matchId}</p>
                <button onClick={onBack} className="btn-primary">
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className={styles.rightPanel}>
          <BattleLog logs={battleLog} />
        </aside>
      </div>
    </div>
  )
}
