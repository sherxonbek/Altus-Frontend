import { apiClient } from './client'

export interface SystemSettings {
  coinPriceUsd: number
  usdToUzsRate: number
  coinPriceUzs: number
  streamRate360p?: number
  streamRate720p?: number
  streamRate1080p?: number
  updatedAt?: string
}

export const getPublicSettings = async (): Promise<SystemSettings> => {
  const response = await apiClient.get<SystemSettings>('/settings')
  return response.data
}

export const updateAdminSettings = async (data: {
  coinPriceUsd?: number
  usdToUzsRate?: number
  streamRate360p?: number
  streamRate720p?: number
  streamRate1080p?: number
}): Promise<{ success: boolean; message: string } & SystemSettings> => {
  const response = await apiClient.put<{ success: boolean; message: string } & SystemSettings>(
    '/settings',
    data
  )
  return response.data
}

