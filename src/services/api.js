import axios from "axios"
import { getToken, setToken, clearAuth, setCurrentUser, getCurrentUser } from './auth'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setToken(token)
  } else {
    delete api.defaults.headers.common['Authorization']
    clearAuth()
  }
}

// Initialize token from storage if present
const existingToken = getToken()
if (existingToken) setAuthToken(existingToken)

export function saveAuth(user, token) {
  if (token) {
    setAuthToken(token)
  }
  setCurrentUser(user)
  window.dispatchEvent(new Event('storage'))
}

export function getCurrentUserInfo() {
  return getCurrentUser()
}

export function logout() {
  setAuthToken(null)
  clearAuth()
  window.dispatchEvent(new Event('storage'))
}

export default api;