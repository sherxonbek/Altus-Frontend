import { apiClient } from './client'
import type { Channel } from '../types'

export const subscriptionApi = {
  getMySubscriptions: async (): Promise<Channel[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; subscriptions: Channel[] }>(
        '/subscriptions'
      )
      return res.data.subscriptions || []
    } catch {
      return []
    }
  },

  checkStatus: async (channelId: string): Promise<boolean> => {
    try {
      const res = await apiClient.get<{ success: boolean; isSubscribed: boolean }>(
        `/subscriptions/check/${channelId}`
      )
      return !!res.data.isSubscribed
    } catch {
      return false
    }
  },

  subscribe: async (channelId: string): Promise<boolean> => {
    try {
      const res = await apiClient.post<{ success: boolean }>(`/subscriptions/${channelId}`)
      return !!res.data.success
    } catch {
      return false
    }
  },

  unsubscribe: async (channelId: string): Promise<boolean> => {
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/subscriptions/${channelId}`)
      return !!res.data.success
    } catch {
      return false
    }
  },
}
