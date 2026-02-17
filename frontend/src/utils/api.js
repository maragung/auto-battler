import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  register: (username, email, password) =>
    client.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    client.post('/auth/login', { email, password }),
  logout: () => client.post('/auth/logout'),
  getCurrentUser: () => client.get('/auth/me'),
}

export const userAPI = {
  getProfile: () => client.get('/users/profile'),
  updateProfile: (data) => client.put('/users/profile', data),
  getCharacters: () => client.get('/users/characters'),
  addCharacter: (characterId) => client.post('/users/characters', { characterId }),
}

export const matchAPI = {
  createMatch: () => client.post('/matches/create'),
  getMatch: (matchId) => client.get(`/matches/${matchId}`),
  getMatches: () => client.get('/matches'),
  updateTeam: (matchId, team) => client.put(`/matches/${matchId}/team`, { team }),
}

export const battleAPI = {
  getUnits: () => client.get('/battle/units'),
  getUnit: (unitId) => client.get(`/battle/units/${unitId}`),
}

export default client
