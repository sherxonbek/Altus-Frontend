import { create } from 'zustand'
import { refreshTokenApi, logoutApi, updateProfileApi, type UpdateProfilePayload, type UpdateProfileResponse } from '../api/auth.api'

export interface User {
  id: string
  fullName: string
  phone: string
  role: string
  avatar?: string
}

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isAuthModalOpen: boolean
  authMode: 'login' | 'register'
  openAuthModal: (mode?: 'login' | 'register') => void
  closeAuthModal: () => void
  setAuthMode: (mode: 'login' | 'register') => void
  setAuth: (accessToken: string, user: User) => void
  setAccessToken: (accessToken: string | null) => void
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (payload: UpdateProfilePayload) => Promise<UpdateProfileResponse>
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem('token') || null,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  isAuthenticated: !!localStorage.getItem('token') || !!localStorage.getItem('user'),
  isLoading: true, // Sahifa yuklanganda sessiyani tekshirish jarayoni
  isAuthModalOpen: false,
  authMode: 'login',

  openAuthModal: (mode = 'login') => {
    set({ isAuthModalOpen: true, authMode: mode })
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false })
  },

  setAuthMode: (mode: 'login' | 'register') => {
    set({ authMode: mode })
  },

  setAuth: (accessToken: string, user: User) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    set({
      accessToken,
      user,
      isAuthenticated: true,
      isLoading: false,
      isAuthModalOpen: false,
    })
  },

  setAccessToken: (accessToken: string | null) => {
    if (accessToken) {
      localStorage.setItem('token', accessToken)
    } else {
      localStorage.removeItem('token')
    }
    set({ accessToken, isAuthenticated: !!accessToken })
  },

  // Sahifa yangilanganda Cookie (refreshToken) orqali sessiyani tekshirish va tiklash
  checkAuth: async () => {
    try {
      const res = await refreshTokenApi()
      if (res.accessToken && res.user) {
        localStorage.setItem('token', res.accessToken)
        localStorage.setItem('user', JSON.stringify(res.user))
        set({
          accessToken: res.accessToken,
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
        })
        return
      }
    } catch {
      // Cookie yo'q yoki muddati o'tgan
    }

    // Agar storage'da ham, cookie'da ham token bo'lmasa:
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!storedToken && !storedUser) {
      set({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } else {
      set({ isLoading: false })
    }
  },

  // Tizimdan chiqish (Logout - Cookie va Storageni tozalash)
  logout: async () => {
    try {
      await logoutApi()
    } catch {
      // Backendda xatolik bo'lsa ham lokal tozalash
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  // Profil ma'lumotlarini yangilash
  updateProfile: async (payload: UpdateProfilePayload) => {
    const res = await updateProfileApi(payload)
    if (res.success && res.user) {
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user })
    }
    return res
  },
}))
