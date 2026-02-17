import styles from './BattleLog.module.css'

export default function BattleLog({ logs = [] }) {
  return (
    <div className={styles.container}>
      <h3>Battle Log</h3>
      <div className={styles.logContainer}>
        {logs.length === 0 ? (
          <div className={styles.empty}>Waiting for battle...</div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className={`${styles.logEntry} ${styles[log.type]}`}
            >
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
