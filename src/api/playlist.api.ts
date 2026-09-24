import { apiClient } from './client'
import type { CoursePlaylist, CourseLesson } from '../types'

export interface LessonStreamData {
  streamUrl: string
  kinescopeId?: string | null
  isKinescope?: boolean
  drmAuthToken?: string
  watermark?: {
    text: string
    userId?: string
    phone?: string
  }
  expiresAt?: number
}

const formatBackendPlaylist = (p: any): CoursePlaylist => {
  const channelObj = p.channelId || {}
  const videos: CourseLesson[] = (p.videos || []).map((v: any) => ({
    id: v.id || v._id?.toString(),
    title: v.title,
    price: v.price || "0 so'm",
    rawPrice: v.rawPrice,
    fileSize: v.fileSize,
    duration: v.duration || '00:00',
    isFree: !!v.isFree,
    videoUrl: v.videoUrl,
    description: v.description,
    thumbnail: v.thumbnail,
  }))

  return {
    id: p._id?.toString() || p.id,
    title: p.title,
    thumbnail: p.thumbnail || (videos[0]?.thumbnail) || '',
    videoCount: p.videoCount || videos.length,
    price: p.price || "0 so'm",
    rawPrice: p.rawPrice || 0,
    authorPrice: p.authorPrice || 0,
    rating: p.rating || 5.0,
    description: p.description || '',
    channel: {
      id: channelObj._id?.toString() || channelObj.id || p.channelId?.toString() || '',
      name: channelObj.title || channelObj.name || 'Noma\'lum kanal',
      avatar: channelObj.avatar || '',
      verified: !!channelObj.verified,
      username: channelObj.username || '',
      subscribers: channelObj.subscribersCount ? `${channelObj.subscribersCount} obunachi` : '0 obunachi',
    },
    videos,
  }
}

export const playlistApi = {
  getAllPlaylists: async (): Promise<CoursePlaylist[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; playlists: any[] }>('/playlists')
      return (res.data.playlists || []).map(formatBackendPlaylist)
    } catch {
      return []
    }
  },

  getPlaylist: async (id: string): Promise<CoursePlaylist | null> => {
    try {
      const res = await apiClient.get<{ success: boolean; playlist: any }>(`/playlists/${id}`)
      return res.data.playlist ? formatBackendPlaylist(res.data.playlist) : null
    } catch {
      return null
    }
  },

  getPlaylistsByChannel: async (channelId: string): Promise<CoursePlaylist[]> => {
    try {
      const res = await apiClient.get<{ success: boolean; playlists: any[] }>(`/playlists/channel/${channelId}`)
      return (res.data.playlists || []).map(formatBackendPlaylist)
    } catch {
      return []
    }
  },

  createPlaylist: async (data: {
    title: string
    totalPrice?: number
    description?: string
    thumbnail?: string
  }): Promise<CoursePlaylist | null> => {
    try {
      const res = await apiClient.post<{ success: boolean; playlist: any }>('/playlists', data)
      return res.data.playlist ? formatBackendPlaylist(res.data.playlist) : null
    } catch {
      return null
    }
  },

  updatePlaylist: async (
    id: string | number,
    data: { title?: string; totalPrice?: number; description?: string; thumbnail?: string }
  ): Promise<CoursePlaylist | null> => {
    try {
      const res = await apiClient.put<{ success: boolean; playlist: any }>(`/playlists/${id}`, data)
      return res.data.playlist ? formatBackendPlaylist(res.data.playlist) : null
    } catch {
      return null
    }
  },

  deletePlaylist: async (id: string | number): Promise<boolean> => {
    try {
      const res = await apiClient.delete<{ success: boolean }>(`/playlists/${id}`)
      return !!res.data.success
    } catch {
      return false
    }
  },

  addVideo: async (
    playlistId: string | number,
    data: {
      title: string
      videoUrl: string
      description?: string
      thumbnail?: string
      duration?: string
      fileSize?: number
    }
  ): Promise<CoursePlaylist | null> => {
    try {
      const res = await apiClient.post<{ success: boolean; playlist: any }>(
        `/playlists/${playlistId}/videos`,
        data
      )
      return res.data.playlist ? formatBackendPlaylist(res.data.playlist) : null
    } catch {
      return null
    }
  },

  updateVideo: async (
    playlistId: string | number,
    videoId: string | number,
    data: {
      title?: string
      description?: string
      videoUrl?: string
      thumbnail?: string
      duration?: string
    }
  ): Promise<CoursePlaylist | null> => {
    try {
      const res = await apiClient.put<{ success: boolean; playlist: any }>(
        `/playlists/${playlistId}/videos/${videoId}`,
        data
      )
      return res.data.playlist ? formatBackendPlaylist(res.data.playlist) : null
    } catch {
      return null
    }
  },

  deleteVideo: async (
    playlistId: string | number,
    videoId: string | number
  ): Promise<CoursePlaylist | null> => {
    try {
      const res = await apiClient.delete<{ success: boolean; playlist: any }>(
        `/playlists/${playlistId}/videos/${videoId}`
      )
      return res.data.playlist ? formatBackendPlaylist(res.data.playlist) : null
    } catch {
      return null
    }
  },

  getLessonStream: async (
    playlistId: string | number,
    lessonId: string | number
  ): Promise<LessonStreamData | null> => {
    try {
      const res = await apiClient.get<{ success: boolean } & LessonStreamData>(
        `/playlists/${playlistId}/lessons/${lessonId}/stream`
      )
      if (res.data && res.data.streamUrl) {
        return res.data
      }
      return null
    } catch {
      return null
    }
  },

  purchaseCourseOrLesson: async (
    playlistId: string | number,
    lessonId?: string | number
  ): Promise<{ success: boolean; message?: string } | null> => {
    try {
      const res = await apiClient.post<{ success: boolean; message?: string }>(
        `/playlists/${playlistId}/purchase`,
        { lessonId }
      )
      return res.data
    } catch {
      return null
    }
  },
}
