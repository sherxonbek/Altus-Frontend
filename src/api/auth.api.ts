import { apiClient } from './client'

export interface SendOtpPayload {
  phone: string
}

export interface SendOtpResponse {
  success: boolean
  message: string
  phone: string
  testCode?: string
}

export interface VerifyOtpPayload {
  phone: string
  code: string
}

export interface VerifyOtpResponse {
  success: boolean
  message: string
}

export interface RegisterPayload {
  phone: string
  fullName: string
  password: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  accessToken: string
  user: {
    id: string
    fullName: string
    phone: string
    role: string
  }
}

export interface RefreshTokenResponse {
  success: boolean
  accessToken: string
  user: {
    id: string
    fullName: string
    phone: string
    role: string
  }
}

export interface UserProfileResponse {
  success: boolean
  user: {
    _id: string
    fullName: string
    phone: string
    role: string
  }
}

// 1-QADAM: SMS kod yuborish
export const sendOtpApi = async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
  const response = await apiClient.post<SendOtpResponse>('/auth/send-otp', payload)
  return response.data
}

// 2-QADAM: SMS kodni tekshirish
export const verifyOtpApi = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
  const response = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', payload)
  return response.data
}

export interface LoginPayload {
  phone: string
  password: string
}

// 3-QADAM: Ro'yxatdan o'tish (Access token va httpOnly Cookie da Refresh token oladi)
export const registerApi = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', payload)
  return response.data
}

// Kirish (Login - Telefon va Parol)
export const loginApi = async (payload: LoginPayload): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/login', payload)
  return response.data
}

// 4-QADAM: Refresh token orqali yangi Access token olish
export const refreshTokenApi = async (): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh')
  return response.data
}

// 5-QADAM: Tizimdan chiqish (Logout)
export const logoutApi = async (): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post('/auth/logout')
  return response.data
}

// Profilni olish
export const getMeApi = async (): Promise<UserProfileResponse> => {
  const response = await apiClient.get<UserProfileResponse>('/auth/me')
  return response.data
}

export interface UpdateProfilePayload {
  fullName?: string
  avatar?: string
  oldPassword?: string
  newPassword?: string
}

export interface UpdateProfileResponse {
  success: boolean
  message: string
  user: {
    id: string
    fullName: string
    phone: string
    role: string
    avatar?: string
  }
}

// Profil ma'lumotlarini yangilash
export const updateProfileApi = async (
  payload: UpdateProfilePayload
): Promise<UpdateProfileResponse> => {
  const response = await apiClient.put<UpdateProfileResponse>('/auth/profile', payload)
  return response.data
}

