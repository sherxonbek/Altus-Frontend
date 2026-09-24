import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // httpOnly cookie (refreshToken) ni yuborish va qabul qilish uchun
  timeout: 20000,
})

// Request interceptor: Xotiradagi (In-Memory) Access Tokenni qo'shish
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: 401 xatolikda avtomatik Refresh Token orqali yangilash
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Agar 401 kelsa va bu refresh so'rovining o'zi bo'lmasa
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true

      try {
        // Cookie'dagi refreshToken orqali yangi accessToken olish
        const refreshResponse = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newAccessToken = refreshResponse.data.accessToken
        useAuthStore.getState().setAccessToken(newAccessToken)

        // Asl so'rovni yangi token bilan qayta yuborish
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh token ham muddati o'tgan bo'lsa, tizimdan chiqarish
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    const serverMessage =
      error.response?.data?.message || error.message || 'Tarmoqda xatolik yuz berdi'
    return Promise.reject(new Error(serverMessage))
  }
)
