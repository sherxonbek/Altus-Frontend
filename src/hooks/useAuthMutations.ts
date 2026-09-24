import { useMutation } from '@tanstack/react-query'
import {
  sendOtpApi,
  verifyOtpApi,
  registerApi,
  loginApi,
  logoutApi,
  type SendOtpPayload,
  type VerifyOtpPayload,
  type RegisterPayload,
  type LoginPayload,
} from '../api/auth.api'
import { useAuthStore } from '../store/useAuthStore'

// 1-QADAM: SMS kod yuborish mutatsiyasi
export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: (payload: SendOtpPayload) => sendOtpApi(payload),
  })
}

// 2-QADAM: SMS kodni tasdiqlash mutatsiyasi
export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtpApi(payload),
  })
}

// 3-QADAM: Ro'yxatdan o'tish mutatsiyasi
export const useRegisterMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerApi(payload),
    onSuccess: (data) => {
      // Access token (xotiraga) va foydalanuvchi ma'lumotlarini saqlash
      setAuth(data.accessToken, data.user)
    },
  })
}

// Kirish (Login) mutatsiyasi
export const useLoginMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginApi(payload),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user)
    },
  })
}

// 4-QADAM: Tizimdan chiqish mutatsiyasi
export const useLogoutMutation = () => {
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      logout()
    },
  })
}
