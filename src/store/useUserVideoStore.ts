import { create } from 'zustand'
import type { CoursePlaylist, CourseLesson } from '../types'
import { playlistApi } from '../api/playlist.api'

export interface UploadVideoPayload {
  title: string
  description?: string
  videoUrl?: string
  thumbnail?: string
  duration?: string
  fileSize?: number
}

export interface CreatePlaylistPayload {
  title: string
  totalPrice?: number // so'mda, masalan: 100000. 0 yoki bo'sh bo'lsa Bepul
  description?: string
  thumbnail?: string
}

export const formatPrice = (amount?: number): string => {
  if (!amount || amount <= 0) return "0 so'm"
  return `${amount.toLocaleString('uz-UZ').replace(/,/g, ' ')} so'm`
}

export const parseDurationToMinutes = (duration?: string): number => {
  if (!duration || typeof duration !== 'string') return 10
  const parts = duration.trim().split(':').map((p) => parseInt(p, 10))
  if (parts.some((p) => isNaN(p))) return 10
  if (parts.length === 3) {
    const totalSec = parts[0] * 3600 + parts[1] * 60 + parts[2]
    return Math.max(1, Math.ceil(totalSec / 60))
  }
  if (parts.length === 2) {
    const totalSec = parts[0] * 60 + parts[1]
    return Math.max(1, Math.ceil(totalSec / 60))
  }
  return 10
}

export const parseFileSizeToMB = (fileSize?: number, durationMinutes: number = 10): number => {
  if (fileSize && typeof fileSize === 'number' && fileSize > 0) {
    return Math.max(1, Math.ceil(fileSize / (1024 * 1024)))
  }
  return Math.max(5, durationMinutes * 3)
}

export const calculateDynamicVideoCost = (durationMinutes: number, sizeMB: number): number => {
  const durationCost = durationMinutes * 70
  const sizeCost = sizeMB * 10
  const baseMargin = 500
  const rawTotal = durationCost + sizeCost + baseMargin
  return Math.max(1500, Math.ceil(rawTotal / 100) * 100)
}

// Playlist umumiy narxini va har bir videoning dinamik server to'lovini hisoblash
export const recalculatePlaylistPrices = (playlist: CoursePlaylist): CoursePlaylist => {
  const count = playlist.videos.length
  if (count === 0) {
    return { ...playlist, price: "0 so'm" }
  }
  const authorTotal = playlist.authorPrice !== undefined ? playlist.authorPrice : (playlist.rawPrice || 0)
  const authorPerVideo = count > 0 && authorTotal > 0 ? Math.round(authorTotal / count) : 0

  let totalCalculated = 0

  const updatedVideos: CourseLesson[] = playlist.videos.map((v: CourseLesson) => {
    const mins = parseDurationToMinutes(v.duration)
    const mb = parseFileSizeToMB(v.fileSize, mins)
    const serverCost = calculateDynamicVideoCost(mins, mb)
    // Muallif narxi ustiga server xarajati va marjasi qo'shiladi (masalan: 10 000 + 1 500 = 11 500)
    const finalLessonPrice = authorPerVideo + serverCost
    totalCalculated += finalLessonPrice

    return {
      ...v,
      rawPrice: finalLessonPrice,
      price: formatPrice(finalLessonPrice),
      isFree: false,
    }
  })

  return {
    ...playlist,
    authorPrice: authorTotal,
    videos: updatedVideos,
    rawPrice: totalCalculated,
    price: formatPrice(totalCalculated),
  }
}

const getStorageKey = (channelId: string) => `c2c_user_playlists_${channelId}`

interface UserVideoState {
  playlists: CoursePlaylist[]
  videos: CoursePlaylist[]
  isLoading: boolean
  loadUserPlaylists: (channelId?: string) => Promise<CoursePlaylist[]>
  loadUserVideos: (channelId?: string) => Promise<CoursePlaylist[]>
  createPlaylist: (
    channel: { id: string; title: string; avatar?: string; username: string; subscribersCount: number },
    payload: CreatePlaylistPayload
  ) => Promise<CoursePlaylist | null>
  addVideoToPlaylist: (
    channelId: string,
    playlistId: string | number,
    payload: UploadVideoPayload
  ) => Promise<CoursePlaylist | null>
  updatePlaylist: (
    channelId: string,
    playlistId: string | number,
    data: { title: string; totalPrice?: number }
  ) => Promise<CoursePlaylist | null>
  updateVideo: (
    channelId: string,
    playlistId: string | number,
    videoId: string | number,
    data: { title: string; description?: string; videoUrl?: string }
  ) => Promise<void>
  deleteVideo: (
    channelId: string,
    playlistId: string | number,
    videoId: string | number
  ) => Promise<void>
  deletePlaylist: (channelId: string, playlistId: string | number) => Promise<void>
  clearVideos: () => void
}

export const useUserVideoStore = create<UserVideoState>((set, get) => ({
  playlists: [],
  videos: [],
  isLoading: false,

  loadUserPlaylists: async (channelId?: string) => {
    if (!channelId) {
      set({ playlists: [], videos: [] })
      return []
    }

    set({ isLoading: true })

    // 1. Keshlangan ma'lumotni ko'rsatish
    try {
      const saved = localStorage.getItem(getStorageKey(channelId))
      if (saved) {
        const parsed: CoursePlaylist[] = JSON.parse(saved)
        const recalculated = parsed.map(recalculatePlaylistPrices)
        set({ playlists: recalculated, videos: recalculated })
      }
    } catch (e) {
      console.error('Failed to read playlists cache:', e)
    }

    // 2. Backenddan yangi ma'lumotni yuklash
    try {
      const remotePlaylists = await playlistApi.getPlaylistsByChannel(channelId)
      if (Array.isArray(remotePlaylists)) {
        const recalculated = remotePlaylists.map(recalculatePlaylistPrices)
        localStorage.setItem(getStorageKey(channelId), JSON.stringify(recalculated))
        set({ playlists: recalculated, videos: recalculated, isLoading: false })
        return recalculated
      }
    } catch (e) {
      console.error('Failed to load user playlists from backend:', e)
    }

    set({ isLoading: false })
    return get().playlists
  },

  loadUserVideos: async (channelId?: string) => {
    return get().loadUserPlaylists(channelId)
  },

  createPlaylist: async (channel, payload) => {
    const rawPrice = payload.totalPrice && payload.totalPrice > 0 ? payload.totalPrice : 0

    // Backendga yuborish
    try {
      const created = await playlistApi.createPlaylist({
        title: payload.title.trim(),
        totalPrice: rawPrice,
        description: payload.description?.trim(),
        thumbnail: payload.thumbnail,
      })

      if (created) {
        const recalculated = recalculatePlaylistPrices(created)
        const updated = [recalculated, ...get().playlists]
        localStorage.setItem(getStorageKey(channel.id), JSON.stringify(updated))
        set({ playlists: updated, videos: updated })
        return recalculated
      }
    } catch (e) {
      console.error('Failed to create playlist on backend:', e)
    }

    // Fallback lokal yaratish
    const fallback: CoursePlaylist = {
      id: `user-playlist-${Date.now()}`,
      title: payload.title.trim(),
      rawPrice,
      price: formatPrice(rawPrice),
      thumbnail: payload.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      videoCount: 0,
      rating: 5.0,
      category: 'Dasturlash',
      channel: {
        id: channel.id,
        name: channel.title,
        avatar: channel.avatar || '',
        verified: false,
        username: channel.username,
      },
      videos: [],
      totalViews: "0 ko'rish",
      salesCount: '0 ta',
      likesCount: 0,
      commentsCount: 0,
    }

    const updated = [fallback, ...get().playlists]
    localStorage.setItem(getStorageKey(channel.id), JSON.stringify(updated))
    set({ playlists: updated, videos: updated })
    return fallback
  },

  addVideoToPlaylist: async (channelId, playlistId, payload) => {
    // Backend API ga yuborish
    try {
      const updatedBackendPlaylist = await playlistApi.addVideo(playlistId, {
        title: payload.title.trim(),
        videoUrl: payload.videoUrl?.trim() || 'https://www.w3schools.com/html/mov_bbb.mp4',
        description: payload.description?.trim(),
        thumbnail: payload.thumbnail,
        duration: payload.duration,
        fileSize: payload.fileSize,
      })

      if (updatedBackendPlaylist) {
        const recalculated = recalculatePlaylistPrices(updatedBackendPlaylist)
        const current = get().playlists
        const index = current.findIndex((p) => String(p.id) === String(playlistId))
        const newPlaylists = [...current]
        if (index !== -1) {
          newPlaylists[index] = recalculated
        } else {
          newPlaylists.unshift(recalculated)
        }
        localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
        set({ playlists: newPlaylists, videos: newPlaylists })
        return recalculated
      }
    } catch (e) {
      console.error('Failed to add video on backend:', e)
    }

    // Fallback lokal yangilash
    const current = get().playlists
    const playlistIndex = current.findIndex((p) => String(p.id) === String(playlistId))
    if (playlistIndex === -1) return null

    const targetPlaylist = current[playlistIndex]
    const newLesson: CourseLesson = {
      id: `lesson-${Date.now()}`,
      title: payload.title.trim(),
      price: 'Bepul',
      duration: payload.duration || '00:00',
      isFree: true,
      videoUrl: payload.videoUrl?.trim() || 'https://www.w3schools.com/html/mov_bbb.mp4',
      description: payload.description?.trim() || '',
    }

    const updatedLessons = [...targetPlaylist.videos, newLesson]
    let updatedPlaylist: CoursePlaylist = {
      ...targetPlaylist,
      videos: updatedLessons,
      videoCount: updatedLessons.length,
      thumbnail:
        payload.thumbnail ||
        (targetPlaylist.thumbnail.includes('photo-1516321318423') && payload.thumbnail
          ? payload.thumbnail
          : targetPlaylist.thumbnail),
    }

    updatedPlaylist = recalculatePlaylistPrices(updatedPlaylist)
    const newPlaylists = [...current]
    newPlaylists[playlistIndex] = updatedPlaylist
    localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
    set({ playlists: newPlaylists, videos: newPlaylists })
    return updatedPlaylist
  },

  updatePlaylist: async (channelId, playlistId, data) => {
    // Backend API ga yuborish
    try {
      const updated = await playlistApi.updatePlaylist(playlistId, {
        title: data.title.trim(),
        totalPrice: data.totalPrice,
      })
      if (updated) {
        const recalculated = recalculatePlaylistPrices(updated)
        const current = get().playlists
        const index = current.findIndex((p) => String(p.id) === String(playlistId))
        const newPlaylists = [...current]
        if (index !== -1) {
          newPlaylists[index] = recalculated
        }
        localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
        set({ playlists: newPlaylists, videos: newPlaylists })
        return recalculated
      }
    } catch (e) {
      console.error('Failed to update playlist on backend:', e)
    }

    // Fallback lokal
    const current = get().playlists
    const playlistIndex = current.findIndex((p) => String(p.id) === String(playlistId))
    if (playlistIndex === -1) return null

    const rawPrice = data.totalPrice !== undefined ? Math.max(0, data.totalPrice) : current[playlistIndex].rawPrice || 0
    let updatedPlaylist: CoursePlaylist = {
      ...current[playlistIndex],
      title: data.title.trim(),
      rawPrice,
      price: formatPrice(rawPrice),
    }

    updatedPlaylist = recalculatePlaylistPrices(updatedPlaylist)
    const newPlaylists = [...current]
    newPlaylists[playlistIndex] = updatedPlaylist
    localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
    set({ playlists: newPlaylists, videos: newPlaylists })
    return updatedPlaylist
  },

  updateVideo: async (channelId, playlistId, videoId, data) => {
    // Backend API ga yuborish
    try {
      const updated = await playlistApi.updateVideo(playlistId, videoId, {
        title: data.title.trim(),
        description: data.description,
      })
      if (updated) {
        const recalculated = recalculatePlaylistPrices(updated)
        const current = get().playlists
        const index = current.findIndex((p) => String(p.id) === String(playlistId))
        const newPlaylists = [...current]
        if (index !== -1) {
          newPlaylists[index] = recalculated
        }
        localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
        set({ playlists: newPlaylists, videos: newPlaylists })
        return
      }
    } catch (e) {
      console.error('Failed to update video on backend:', e)
    }

    // Fallback lokal
    const current = get().playlists
    const playlistIndex = current.findIndex((p) => String(p.id) === String(playlistId))
    if (playlistIndex === -1) return

    const target = current[playlistIndex]
    const updatedVideos = target.videos.map((v: CourseLesson) => {
      if (String(v.id) === String(videoId)) {
        return {
          ...v,
          title: data.title.trim(),
          description: data.description ?? v.description,
          videoUrl: data.videoUrl ?? v.videoUrl,
        }
      }
      return v
    })

    const updatedPlaylist = { ...target, videos: updatedVideos }
    const newPlaylists = [...current]
    newPlaylists[playlistIndex] = updatedPlaylist
    localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
    set({ playlists: newPlaylists, videos: newPlaylists })
  },

  deleteVideo: async (channelId, playlistId, videoId) => {
    // Backend API ga yuborish
    try {
      const updated = await playlistApi.deleteVideo(playlistId, videoId)
      if (updated) {
        const recalculated = recalculatePlaylistPrices(updated)
        const current = get().playlists
        const index = current.findIndex((p) => String(p.id) === String(playlistId))
        const newPlaylists = [...current]
        if (index !== -1) {
          newPlaylists[index] = recalculated
        }
        localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
        set({ playlists: newPlaylists, videos: newPlaylists })
        return
      }
    } catch (e) {
      console.error('Failed to delete video on backend:', e)
    }

    // Fallback lokal
    const current = get().playlists
    const playlistIndex = current.findIndex((p) => String(p.id) === String(playlistId))
    if (playlistIndex === -1) return

    const target = current[playlistIndex]
    const updatedVideos = target.videos.filter((v: CourseLesson) => String(v.id) !== String(videoId))

    let updatedPlaylist = {
      ...target,
      videos: updatedVideos,
      videoCount: updatedVideos.length,
    }

    updatedPlaylist = recalculatePlaylistPrices(updatedPlaylist)
    const newPlaylists = [...current]
    newPlaylists[playlistIndex] = updatedPlaylist
    localStorage.setItem(getStorageKey(channelId), JSON.stringify(newPlaylists))
    set({ playlists: newPlaylists, videos: newPlaylists })
  },

  deletePlaylist: async (channelId, playlistId) => {
    // Backend API dan o'chirish
    try {
      await playlistApi.deletePlaylist(playlistId)
    } catch (e) {
      console.error('Failed to delete playlist on backend:', e)
    }

    const current = get().playlists
    const updated = current.filter((p) => String(p.id) !== String(playlistId))
    localStorage.setItem(getStorageKey(channelId), JSON.stringify(updated))
    set({ playlists: updated, videos: updated })
  },

  clearVideos: () => {
    set({ playlists: [], videos: [] })
  },
}))
