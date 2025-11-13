import { defineStore } from 'pinia'
import { api } from 'boot/axios'

const TOKEN_KEY = 'auth_token'
// Modo demo: solo activo en desarrollo si VITE_USE_FAKE_AUTH === 'true'
const DEMO_MODE = import.meta?.env?.VITE_USE_FAKE_AUTH === 'true' && !import.meta.env.PROD
const DEMO_EMAIL = import.meta?.env?.VITE_DEMO_EMAIL || 'admin@demo.com'
const DEMO_PASSWORD = import.meta?.env?.VITE_DEMO_PASSWORD || 'Admin123!'
const DEMO_ALLOW_ANY = import.meta?.env?.VITE_DEMO_ALLOW_ANY === 'true'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
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

    async login({ email, password }) {
      this.loading = true
      this.error = null
      try {
        // Demo mode: validar localmente
        if (DEMO_MODE && (DEMO_ALLOW_ANY || (email === DEMO_EMAIL && password === DEMO_PASSWORD))) {
          const fake = {
            token: 'dev-token',
            user: { id: 'demo-1', name: 'Administrador Demo', email: DEMO_EMAIL, role: 'admin' },
          }
          this.setToken(fake.token)
          this.user = fake.user
          return fake
        }

        // Ajusta el endpoint de login según tu API
        const { data } = await api.post('/auth/login', { email, password })
        const token = data?.token
        this.setToken(token)
        // Opcional: cargar datos del usuario actual
        this.user = data?.user || null
        return data
      } catch (err) {
        this.error = err
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.setToken('')
    },

    // Llamar esto al boot si es necesario
    hydrateFromStorage() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        this.setToken(token)
      }
    },
  },
})
