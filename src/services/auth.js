import { ref, computed } from 'vue'

// Global authentication state
const token = ref(localStorage.getItem('auth_token'))
const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))

export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (username, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      
      if (response.ok) {
        const data = await response.json()
        token.value = data.token
        user.value = data.user
        
        // Store in localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        
        return { success: true, data }
      } else {
        const error = await response.json()
        return { success: false, error: error.message || 'Login failed' }
      }
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message }
    }
  }
  
  const register = async (userData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        const error = await response.json()
        return { success: false, error: error.message || 'Registration failed' }
      }
    } catch (err) {
      return { success: false, error: 'Network error: ' + err.message }
    }
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
  
  const getAuthHeaders = () => {
    if (token.value) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }
  
  return {
    token: token.value,
    user: user.value,
    isAuthenticated,
    login,
    register,
    logout,
    getAuthHeaders
  }
}
