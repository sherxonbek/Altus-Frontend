import { create } from 'zustand'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

interface ToastState {
  toasts: ToastItem[]
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', duration?: number) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (message, type = 'success', duration = 2800) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, duration)
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
