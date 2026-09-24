import { create } from 'zustand'
import { type Channel } from '../types'
import { useAuthStore } from './useAuthStore'
import { useChannelStore } from './useChannelStore'
import { subscriptionApi } from '../api/subscription.api'

interface SubscriptionState {
  subscriptions: Channel[]
  selectedChannelId: string | null
  isLoading: boolean
  subscribe: (channel: Channel) => Promise<void>
  unsubscribe: (channelId: string) => Promise<void>
  toggleSubscription: (channel: Channel) => Promise<void>
  isSubscribed: (channelIdOrName?: string) => boolean
  setSelectedChannelId: (channelId: string | null) => void
  loadUserSubscriptions: (userId?: string) => Promise<void>
  clearSubscriptions: () => void
}

const getUserId = (user?: any): string | undefined => {
  return user?.id || user?._id || user?.phone
}

const getStorageKey = (userId?: string) => {
  return userId ? `altus_subs_${userId}` : 'altus_guest_subs'
}

// Foydalanuvchining o'z kanali ekanligini tekshirish
const isUserOwnChannel = (channelIdOrName?: string, channel?: Channel): boolean => {
  if (!channelIdOrName && !channel) return false
  const myChannel = useChannelStore.getState().currentChannel
  if (!myChannel) return false

  const targetId = channel?.id || channelIdOrName
  const targetName = channel?.name || channelIdOrName
  const targetUsername = channel?.username

  if (targetId && String(targetId) === String(myChannel.id)) return true
  if (targetName && targetName.toLowerCase() === myChannel.title.toLowerCase()) return true
  if (targetUsername && myChannel.username && targetUsername.toLowerCase() === myChannel.username.toLowerCase()) return true
  if (channelIdOrName && myChannel.username && channelIdOrName.toLowerCase() === myChannel.username.toLowerCase()) return true

  return false
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => {
  const auth = useAuthStore.getState()
  let initialSubs: Channel[] = []

  try {
    localStorage.removeItem('altus_user_subscriptions')
  } catch {
    // ignore
  }

  const currentUserId = getUserId(auth.user)

  if (auth.isAuthenticated && currentUserId) {
    try {
      const saved = localStorage.getItem(getStorageKey(currentUserId))
      if (saved) {
        const parsed: Channel[] = JSON.parse(saved)
        initialSubs = parsed.filter((c) => !isUserOwnChannel(undefined, c))
      }
    } catch (e) {
      console.error(e)
    }
  }

  return {
    subscriptions: initialSubs,
    selectedChannelId: null,
    isLoading: false,

    subscribe: async (channel: Channel) => {
      const auth = useAuthStore.getState()
      const userId = getUserId(auth.user)
      if (!auth.isAuthenticated || !userId) {
        return
      }
      // O'z kanaliga o'zi obuna bo'la olmaydi
      if (isUserOwnChannel(undefined, channel)) {
        return
      }
      const current = get().subscriptions
      if (!current.some((c) => c.id === channel.id || c.name === channel.name)) {
        const updated = [channel, ...current]
        localStorage.setItem(getStorageKey(userId), JSON.stringify(updated))
        set({ subscriptions: updated })

        // Backendga yuborish
        try {
          await subscriptionApi.subscribe(channel.id)
        } catch (e) {
          console.error('Subscription backend error:', e)
        }
      }
    },

    unsubscribe: async (channelId: string) => {
      const auth = useAuthStore.getState()
      const userId = getUserId(auth.user)
      const current = get().subscriptions
      const updated = current.filter((c) => c.id !== channelId && c.name !== channelId)
      if (userId) {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(updated))
      }
      set({
        subscriptions: updated,
        selectedChannelId: get().selectedChannelId === channelId ? null : get().selectedChannelId,
      })

      // Backenddan o'chirish
      try {
        await subscriptionApi.unsubscribe(channelId)
      } catch (e) {
        console.error('Unsubscribe backend error:', e)
      }
    },

    toggleSubscription: async (channel: Channel) => {
      const auth = useAuthStore.getState()
      const userId = getUserId(auth.user)
      if (!auth.isAuthenticated || !userId) {
        return
      }
      if (isUserOwnChannel(undefined, channel)) {
        return
      }
      const isSub = get().isSubscribed(channel.id) || get().isSubscribed(channel.name)
      if (isSub) {
        await get().unsubscribe(channel.id || channel.name)
      } else {
        await get().subscribe(channel)
      }
    },

    isSubscribed: (channelIdOrName?: string) => {
      const auth = useAuthStore.getState()
      if (!auth.isAuthenticated || !auth.user || !channelIdOrName) return false
      if (isUserOwnChannel(channelIdOrName)) return false
      return get().subscriptions.some(
        (c) => c.id === channelIdOrName || c.name.toLowerCase() === channelIdOrName.toLowerCase()
      )
    },

    setSelectedChannelId: (channelId: string | null) => {
      set({ selectedChannelId: channelId })
    },

    loadUserSubscriptions: async (userId?: string) => {
      if (!userId) {
        set({ subscriptions: [], selectedChannelId: null })
        return
      }

      set({ isLoading: true })

      // 1. Keshlangan ma'lumotni darhol yuklash
      try {
        const saved = localStorage.getItem(getStorageKey(userId))
        if (saved) {
          const parsed: Channel[] = JSON.parse(saved)
          const filtered = parsed.filter((c) => !isUserOwnChannel(undefined, c))
          set({ subscriptions: filtered })
        }
      } catch (e) {
        console.error(e)
      }

      // 2. Backenddan yangi ro'yxatni yuklash
      try {
        const remoteSubs = await subscriptionApi.getMySubscriptions()
        if (Array.isArray(remoteSubs)) {
          const filtered = remoteSubs.filter((c) => !isUserOwnChannel(undefined, c))
          localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered))
          set({ subscriptions: filtered, isLoading: false })
          return
        }
      } catch (e) {
        console.error('Failed to load subscriptions from backend:', e)
      }

      set({ isLoading: false })
    },

    clearSubscriptions: () => {
      set({ subscriptions: [], selectedChannelId: null })
    },
  }
})

// useAuthStore o'zgarganda (login, logout, register) avtomatik sinxronlash
useAuthStore.subscribe((state, prevState) => {
  const currentId = getUserId(state.user)
  const prevId = getUserId(prevState?.user)
  if (state.isAuthenticated && currentId) {
    if (currentId !== prevId || !prevState?.isAuthenticated) {
      useSubscriptionStore.getState().loadUserSubscriptions(currentId)
    }
  } else if (!state.isAuthenticated) {
    useSubscriptionStore.getState().clearSubscriptions()
  }
})

