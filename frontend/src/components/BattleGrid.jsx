import { POSITION_NAMES, RARITY_COLORS } from '../utils/characters'
import styles from './BattleGrid.module.css'

export default function BattleGrid({ isPlayer, team, onPlace, selectedUnit }) {
  const handleCellClick = (index) => {
    if (isPlayer && selectedUnit && onPlace) {
      onPlace(index, selectedUnit)
    }
  }

  const getUnitAtPosition = (index) => {
    return team.find(unit => unit.position === index)
  }

  return (
    <div className={styles.grid}>
      {Array.from({ length: 9 }).map((_, index) => {
        const unit = getUnitAtPosition(index)
        const isValidPlacement = isPlayer && selectedUnit && !unit

        return (
          <div
            key={index}
            className={`
              ${styles.cell}
              ${unit ? styles.occupied : ''}
              ${isValidPlacement ? styles.validPlacement : ''}
              ${index < 3 ? styles.backRow : index < 6 ? styles.midRow : styles.frontRow}
            `}
            onClick={() => handleCellClick(index)}
            title={POSITION_NAMES[index]}
            style={{
              borderColor: unit ? RARITY_COLORS[unit.rarity] : undefined
            }}
          >
            {unit && (
              <div className={styles.unitInfo}>
                <div className={styles.unitName}>{unit.name}</div>
                <div className={styles.unitHP}>❤️ {unit.currentHp || unit.hp}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
