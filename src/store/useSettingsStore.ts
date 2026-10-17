import { create } from 'zustand'
import { getPublicSettings, updateAdminSettings, type SystemSettings } from '../api/settings.api'

interface SettingsState {
  settings: SystemSettings
  isLoading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (data: {
    coinPriceUsd?: number
    usdToUzsRate?: number
    streamRate360p?: number
    streamRate720p?: number
    streamRate1080p?: number
  }) => Promise<void>
  calculateCoins: (priceInUzs: number) => number
  formatCoins: (priceInUzs: number) => string
}

const DEFAULT_SETTINGS: SystemSettings = {
  coinPriceUsd: 0.01,
  usdToUzsRate: 13000,
  coinPriceUzs: 130,
  streamRate360p: 1,
  streamRate720p: 3,
  streamRate1080p: 7,
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true })
    try {
      const data = await getPublicSettings()
      if (data && data.coinPriceUzs) {
        set({ settings: data })
      }
    } catch {
      // Offline or network error, fallback to default
    } finally {
      set({ isLoading: false })
    }
  },

  updateSettings: async (data) => {
    set({ isLoading: true })
    try {
      const res = await updateAdminSettings(data)
      if (res && res.coinPriceUzs) {
        set({
          settings: {
            coinPriceUsd: res.coinPriceUsd,
            usdToUzsRate: res.usdToUzsRate,
            coinPriceUzs: res.coinPriceUzs,
            streamRate360p: res.streamRate360p !== undefined ? res.streamRate360p : 1,
            streamRate720p: res.streamRate720p !== undefined ? res.streamRate720p : 3,
            streamRate1080p: res.streamRate1080p !== undefined ? res.streamRate1080p : 7,
            updatedAt: res.updatedAt,
          },
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  calculateCoins: (priceInUzs: number) => {
    if (!priceInUzs || priceInUzs <= 0) return 0
    const coinPrice = get().settings.coinPriceUzs || 130
    return Math.ceil(priceInUzs / coinPrice)
  },

  formatCoins: (priceInUzs: number) => {
    const coins = get().calculateCoins(priceInUzs)
    if (coins <= 0) return 'Bepul'
    return `${coins.toLocaleString()} 🪙`
  },
}))
