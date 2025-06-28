import axios from 'axios'

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export const baseAPI = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
baseAPI.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle common error patterns
baseAPI.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // If error is in HTML format (error page)
    if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      // Try to extract the actual error message
      const matches = error.response.data.match(/<pre>Error: ([^<]+)<br>/)
      if (matches && matches[1]) {
        error.message = matches[1].trim()
      }
    }
    return Promise.reject(error)
  }
)

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)

export const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes

function startSessionTimer() {
  setTimeout(() => {
    logoutUser()
  }, SESSION_TIMEOUT)
}

function logoutUser() {
  sessionStorage.removeItem('accessToken')
  localStorage.removeItem('userData')
  window.location.replace('/login')
}

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      logoutUser() // Logout when token expires
    } else if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      // Try to extract the actual error message from HTML
      const matches = error.response.data.match(/<pre>Error: ([^<]+)<br>/)
      if (matches && matches[1]) {
        error.message = matches[1].trim()
      }
    }
    return Promise.reject(error)
  }
)

// Initialize the session timer
if (typeof window !== 'undefined') {
  const hasToken = !!sessionStorage.getItem('accessToken')
  if (hasToken) {
    startSessionTimer()
  }
}

export default api
