import { defineStore } from 'pinia'
import { api } from 'boot/axios'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    // user: { id, name, email, role }
    user: JSON.parse(localStorage.getItem('auth_user')) || null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    // Redirección por rol: admin | leader | collaborator
    homeByRole(role) {
      const r = (role || this.user?.role || '').toString().toLowerCase()
      if (r === 'adminrrhh' || r === 'admin' || r === 'rrhh') return '/admin/skills'
      if (r === 'leader' || r === 'líder' || r === 'lider') return '/dashboard/lider'
      return '/dashboard/colaborador'
    },

    setToken(token) {
      this.token = token || ''
      if (this.token) {
        localStorage.setItem(TOKEN_KEY, this.token)
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      } else {
        localStorage.removeItem(TOKEN_KEY)
        delete api.defaults.headers.common.Authorization
      }
    },

    setUser(user) {
      this.user = user || null
      if (this.user) {
        localStorage.setItem('auth_user', JSON.stringify(this.user))
      } else {
        localStorage.removeItem('auth_user')
      }
    },

    async login({ email, password }) {
      this.loading = true
      this.error = null
      try {
        // Ajusta el endpoint de login según tu API
        console.log('Intentando login en:', api.defaults.baseURL + '/api/Auth/login')
        const { data } = await api.post('/api/Auth/login', { email, password })
        const token = data?.token
        this.setToken(token)
        // Opcional: cargar datos del usuario actual
        this.setUser(data?.user)
        return data
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    // Login demo sin API (temporal)
    async demoLogin() {
      this.loading = true
      this.error = null
      try {
        // Simular delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        const fakeToken = 'demo-token-' + Date.now()
        const fakeUser = { id: 1, name: 'Usuario Demo', email: 'demo@example.com', role: 'admin' }
        this.setToken(fakeToken)
        this.setUser(fakeUser)
        return { token: fakeToken, user: fakeUser }
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.setUser(null)
      this.setToken('')
    },

    // Llamar esto al boot si es necesario
    hydrateFromStorage() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        this.setToken(token)
      }
      const user = localStorage.getItem('auth_user')
      if (user) {
        this.user = JSON.parse(user)
      }
    },
  },
})
