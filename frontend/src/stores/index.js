import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
    set({ token })
  },
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, token: null }),
}))

export const useGameStore = create((set, get) => ({
  characters: [],
  currentCharacter: null,
  matches: [],
  currentMatch: null,

  setCharacters: (characters) => set({ characters }),
  setCurrentCharacter: (character) => set({ currentCharacter: character }),
  addCharacter: (character) => {
    const { characters } = get()
    set({ characters: [...characters, character] })
  },
  setMatches: (matches) => set({ matches }),
  setCurrentMatch: (match) => set({ currentMatch: match }),
}))

export const useBattleStore = create((set, get) => ({
  board: Array(9).fill(null),
  playerTeam: [],
  opponentTeam: [],
  selectedUnit: null,
  gameState: 'setup', // setup, playing, finished
  battleLog: [],

  setBoard: (board) => set({ board }),
  setPlayerTeam: (team) => set({ playerTeam: team }),
  setOpponentTeam: (team) => set({ opponentTeam: team }),
  setSelectedUnit: (unit) => set({ selectedUnit: unit }),
  setGameState: (state) => set({ gameState: state }),
  addBattleLog: (log) => {
    const { battleLog } = get()
    set({ battleLog: [...battleLog, log] })
  },
  clearBoard: () => set({
    board: Array(9).fill(null),
    playerTeam: [],
    opponentTeam: [],
    selectedUnit: null,
    gameState: 'setup',
    battleLog: []
  }),
  placeUnit: (index, unit) => {
    const { board, playerTeam } = get()
    const newBoard = [...board]
    newBoard[index] = unit
    set({
      board: newBoard,
      playerTeam: [...playerTeam, unit]
    })
  },
}))

export const useUIStore = create((set) => ({
  sidebarOpen: false,
  notif: null,
  notifType: 'info', // success, error, warning, info

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  showNotif: (message, type = 'info') => {
    set({ notif: message, notifType: type })
    setTimeout(() => {
      set({ notif: null })
    }, 5000)
  },
}))
