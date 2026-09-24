import { create } from 'zustand'
import { useAuthStore } from './useAuthStore'
import { channelApi } from '../api/channel.api'
import { useUserVideoStore } from './useUserVideoStore'

export interface UserChannel {
  id: string
  userId: string
  title: string
  username: string
  avatar?: string
  banner?: string
  description?: string
  subscribersCount: number
  videosCount: number
  createdAt: string
}

interface ChannelState {
  currentChannel: UserChannel | null
  isLoading: boolean
  loadUserChannel: (userId?: string) => Promise<UserChannel | null>
  saveChannel: (
    data: {
      title: string
      username: string
      avatar?: string
      banner?: string
      description?: string
    }
  ) => Promise<{ success: boolean; error?: string; channel?: UserChannel }>
  isUsernameAvailable: (username: string, currentChannelId?: string) => boolean
}

const getUserId = (user?: any): string | undefined => {
  return user?.id || user?._id || user?.phone
}

const getStorageKey = (userId: string) => `altus_user_channel_${userId}`

// Tizimdagi ma'lum bo'lgan username'larni olish (tezkor tekshiruv uchun)
const getTakenUsernames = (excludeChannelId?: string): string[] => {
  const usernames: string[] = []

  // localStorage dagi foydalanuvchilarning kanallari
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('altus_user_channel_')) {
        const item = localStorage.getItem(key)
        if (item) {
          const parsed: UserChannel = JSON.parse(item)
          if (parsed && parsed.id !== excludeChannelId && parsed.username) {
            usernames.push(parsed.username.replace('@', '').toLowerCase())
          }
        }
      }
    }
  } catch (e) {
    console.error('Failed to read usernames from storage:', e)
  }

  return usernames
}

export const useChannelStore = create<ChannelState>((set, get) => {
  const auth = useAuthStore.getState()
  const userId = getUserId(auth.user)
  let initialChannel: UserChannel | null = null

  if (auth.isAuthenticated && userId) {
    try {
      const saved = localStorage.getItem(getStorageKey(userId))
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed) {
          parsed.id = parsed.id || parsed._id?.toString()
          initialChannel = parsed
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  return {
    currentChannel: initialChannel,
    isLoading: false,

    loadUserChannel: async (userId?: string) => {
      if (!userId) {
        set({ currentChannel: null })
        return null
      }

      set({ isLoading: true })

      // 1. Avval keshlangan ma'lumotni ko'rsatish
      try {
        const saved = localStorage.getItem(getStorageKey(userId))
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed) {
            parsed.id = parsed.id || parsed._id?.toString()
            set({ currentChannel: parsed })
            if (parsed.id) {
              useUserVideoStore.getState().loadUserPlaylists(parsed.id)
            }
          }
        }
      } catch (e) {
        console.error(e)
      }

      // 2. Backenddan yangi ma'lumotni olish
      try {
        const remoteChannel = await channelApi.getMyChannel()
        if (remoteChannel) {
          remoteChannel.id = remoteChannel.id || (remoteChannel as any)._id?.toString()
          localStorage.setItem(getStorageKey(userId), JSON.stringify(remoteChannel))
          set({ currentChannel: remoteChannel, isLoading: false })
          if (remoteChannel.id) {
            useUserVideoStore.getState().loadUserPlaylists(remoteChannel.id)
          }
          return remoteChannel
        }
      } catch (e) {
        console.error('Failed to fetch channel from backend:', e)
      }

      set({ isLoading: false })
      return get().currentChannel
    },

    isUsernameAvailable: (username: string, currentChannelId?: string) => {
      const clean = username.trim().replace('@', '').toLowerCase()
      if (!clean) return false
      const taken = getTakenUsernames(currentChannelId)
      return !taken.includes(clean)
    },

    saveChannel: async (data) => {
      const auth = useAuthStore.getState()
      const userId = getUserId(auth.user)
      if (!auth.isAuthenticated || !userId) {
        return { success: false, error: "Kanal yaratish uchun tizimga kirgan bo'lishingiz kerak." }
      }

      const cleanTitle = data.title.trim()
      if (!cleanTitle) {
        return { success: false, error: "Kanal nomi (title) majburiy." }
      }

      let cleanUsername = data.username.trim().toLowerCase()
      if (cleanUsername.startsWith('@')) {
        cleanUsername = cleanUsername.slice(1)
      }

      if (!cleanUsername) {
        return { success: false, error: "Username majburiy." }
      }

      if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
        return {
          success: false,
          error: "Username faqat 3-30 ta lotin harflari, raqamlar yoki pastki chiziqdan iborat bo'lishi kerak.",
        }
      }

      // Backend API ga saqlash
      const res = await channelApi.saveChannel({
        title: cleanTitle,
        username: cleanUsername,
        avatar: data.avatar?.trim() || undefined,
        banner: data.banner?.trim() || undefined,
        description: data.description?.trim() || undefined,
      })

      if (!res.success || !res.channel) {
        return {
          success: false,
          error: res.error || "Serverda kanalni saqlashda xatolik yuz berdi.",
        }
      }

      const savedChannel = res.channel
      savedChannel.id = savedChannel.id || (savedChannel as any)._id?.toString()
      localStorage.setItem(getStorageKey(userId), JSON.stringify(savedChannel))
      set({ currentChannel: savedChannel })
      if (savedChannel.id) {
        useUserVideoStore.getState().loadUserPlaylists(savedChannel.id)
      }

      return { success: true, channel: savedChannel }
    },
  }
})

// Auth o'zgarganda kanalni yangilash
useAuthStore.subscribe((state, prevState) => {
  const currentId = getUserId(state.user)
  const prevId = getUserId(prevState?.user)
  if (state.isAuthenticated && currentId) {
    if (currentId !== prevId || !prevState?.isAuthenticated) {
      useChannelStore.getState().loadUserChannel(currentId)
    }
  } else if (!state.isAuthenticated) {
    useChannelStore.setState({ currentChannel: null })
  }
})

