import { apiClient } from './client'
import type { UserChannel } from '../store/useChannelStore'

export interface ChannelApiResponse {
  success: boolean
  channel?: any
  message?: string
}

export function formatBackendChannel(c: any): UserChannel {
  return {
    id: c.id || c._id?.toString() || '',
    userId: c.userId?._id?.toString() || c.userId?.toString() || '',
    title: c.title || '',
    username: c.username || '',
    avatar: c.avatar,
    banner: c.banner,
    description: c.description,
    subscribersCount: c.subscribersCount || 0,
    videosCount: c.videosCount || 0,
    createdAt: c.createdAt || new Date().toISOString(),
  }
}

export const channelApi = {
  getMyChannel: async (): Promise<UserChannel | null> => {
    try {
      const res = await apiClient.get<ChannelApiResponse>('/channels/me')
      return res.data.channel ? formatBackendChannel(res.data.channel) : null
    } catch {
      return null
    }
  },

  getAllChannels: async (): Promise<UserChannel[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; channels: any[] }>('/channels')
      return (res.data.channels || []).map(formatBackendChannel)
    } catch {
      return []
    }
  },

  getChannel: async (idOrUsername: string): Promise<UserChannel | null> => {
    try {
      const res = await apiClient.get<ChannelApiResponse>(`/channels/${idOrUsername}`)
      return res.data.channel ? formatBackendChannel(res.data.channel) : null
    } catch {
      return null
    }
  },

  checkUsername: async (username: string, excludeId?: string): Promise<boolean> => {
    try {
      const res = await apiClient.get<{ success: boolean; available: boolean }>(
        `/channels/check-username/${username}`,
        { params: { excludeId } }
      )
      return res.data.available
    } catch {
      return true
    }
  },

  saveChannel: async (data: {
    title: string
    username: string
    avatar?: string
    banner?: string
    description?: string
  }): Promise<{ success: boolean; channel?: UserChannel; error?: string }> => {
    try {
      const res = await apiClient.post<ChannelApiResponse>('/channels', data)
      if (res.data.success && res.data.channel) {
        return { success: true, channel: formatBackendChannel(res.data.channel) }
      }
      return { success: false, error: res.data.message || 'Xatolik yuz berdi' }
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Serverga ulanishda xatolik',
      }
    }
  },
}
