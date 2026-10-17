import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CoursePlaylist, CourseLesson } from '../types'

export interface SavedLessonItem {
  lesson: CourseLesson
  courseId: string | number
  courseTitle: string
  courseThumbnail: string
  savedAt: string
}

export interface SavedPlaylistItem {
  playlist: CoursePlaylist
  savedAt: string
}

interface SavedStoreState {
  savedPlaylists: SavedPlaylistItem[]
  savedLessons: SavedLessonItem[]

  // Playlist (kurs) saqlash / o'chirish
  toggleSavePlaylist: (playlist: CoursePlaylist) => { isSaved: boolean; message: string }
  isPlaylistSaved: (playlistId: string | number) => boolean
  removePlaylist: (playlistId: string | number) => void

  // Alohida darslik saqlash / o'chirish
  toggleSaveLesson: (lesson: CourseLesson, course: CoursePlaylist) => { isSaved: boolean; message: string }
  isLessonSaved: (lessonId: string | number) => boolean
  removeLesson: (lessonId: string | number) => void

  // Barcha saqlanganlarni tozalash
  clearAllSaved: () => void
}

export const useSavedStore = create<SavedStoreState>()(
  persist(
    (set, get) => ({
      savedPlaylists: [],
      savedLessons: [],

      isPlaylistSaved: (playlistId: string | number) => {
        const idStr = String(playlistId)
        return get().savedPlaylists.some((item) => String(item.playlist.id) === idStr)
      },

      toggleSavePlaylist: (playlist: CoursePlaylist) => {
        const idStr = String(playlist.id)
        const exists = get().savedPlaylists.some((item) => String(item.playlist.id) === idStr)

        if (exists) {
          set((state) => ({
            savedPlaylists: state.savedPlaylists.filter((item) => String(item.playlist.id) !== idStr),
          }))
          return { isSaved: false, message: 'Kurs saqlanganlardan olib tashlandi' }
        } else {
          const newItem: SavedPlaylistItem = {
            playlist,
            savedAt: new Date().toISOString(),
          }
          set((state) => ({
            savedPlaylists: [newItem, ...state.savedPlaylists],
          }))
          return { isSaved: true, message: 'Kurs saqlanganlarga qoʻshildi' }
        }
      },

      removePlaylist: (playlistId: string | number) => {
        const idStr = String(playlistId)
        set((state) => ({
          savedPlaylists: state.savedPlaylists.filter((item) => String(item.playlist.id) !== idStr),
        }))
      },

      isLessonSaved: (lessonId: string | number) => {
        const idStr = String(lessonId)
        return get().savedLessons.some((item) => String(item.lesson.id) === idStr)
      },

      toggleSaveLesson: (lesson: CourseLesson, course: CoursePlaylist) => {
        const idStr = String(lesson.id)
        const exists = get().savedLessons.some((item) => String(item.lesson.id) === idStr)

        if (exists) {
          set((state) => ({
            savedLessons: state.savedLessons.filter((item) => String(item.lesson.id) !== idStr),
          }))
          return { isSaved: false, message: 'Dars saqlanganlardan olib tashlandi' }
        } else {
          const newItem: SavedLessonItem = {
            lesson,
            courseId: course.id,
            courseTitle: course.title,
            courseThumbnail: course.thumbnail || '',
            savedAt: new Date().toISOString(),
          }
          set((state) => ({
            savedLessons: [newItem, ...state.savedLessons],
          }))
          return { isSaved: true, message: 'Dars saqlanganlarga qoʻshildi' }
        }
      },

      removeLesson: (lessonId: string | number) => {
        const idStr = String(lessonId)
        set((state) => ({
          savedLessons: state.savedLessons.filter((item) => String(item.lesson.id) !== idStr),
        }))
      },

      clearAllSaved: () => {
        set({ savedPlaylists: [], savedLessons: [] })
      },
    }),
    {
      name: 'c2c_saved_courses_v1',
    }
  )
)

export interface HistoryStoreState {
  history: import('../types').HistoryItem[]
  isHistoryPaused: boolean
  addToHistory: (item: Omit<import('../types').HistoryItem, 'watchedAt'> & { watchedAt?: string }) => void
  removeFromHistory: (id: string | number) => void
  clearHistory: () => void
  togglePauseHistory: () => void
  seedHistoryIfEmpty: (playlists: CoursePlaylist[]) => void
}

export const useHistoryStore = create<HistoryStoreState>()(
  persist(
    (set, get) => ({
      history: [],
      isHistoryPaused: false,

      addToHistory: (item) => {
        if (get().isHistoryPaused) return

        const currentHistory = get().history
        const existingIndex = currentHistory.findIndex(
          (h) => String(h.playlistId) === String(item.playlistId)
        )

        const newItem: import('../types').HistoryItem = {
          ...item,
          id: item.id || `hist-${Date.now()}-${item.playlistId}`,
          watchedAt: item.watchedAt || new Date().toISOString(),
          progress: Math.min(100, Math.max(0, item.progress ?? 15)),
        }

        let updated: import('../types').HistoryItem[]
        if (existingIndex !== -1) {
          const copy = [...currentHistory]
          copy.splice(existingIndex, 1)
          updated = [newItem, ...copy]
        } else {
          updated = [newItem, ...currentHistory]
        }

        set({ history: updated })
      },

      removeFromHistory: (id: string | number) => {
        set((state) => ({
          history: state.history.filter((item) => String(item.id) !== String(id)),
        }))
      },

      clearHistory: () => {
        set({ history: [] })
      },

      togglePauseHistory: () => {
        set((state) => ({ isHistoryPaused: !state.isHistoryPaused }))
      },

      seedHistoryIfEmpty: (playlists: CoursePlaylist[]) => {
        const state = get()
        if (state.history.length > 0 || !playlists || playlists.length === 0) return

        const now = Date.now()
        const oneHour = 3600 * 1000
        const oneDay = 24 * oneHour

        const mockHistory: import('../types').HistoryItem[] = playlists.slice(0, 8).map((playlist, idx) => {
          let timeOffset: number
          let progressVal: number

          if (idx === 0) {
            timeOffset = 25 * 60 * 1000 // 25 min oldin
            progressVal = 72
          } else if (idx === 1) {
            timeOffset = 2 * oneHour // 2 soat oldin
            progressVal = 45
          } else if (idx === 2) {
            timeOffset = 5 * oneHour // 5 soat oldin
            progressVal = 90
          } else if (idx === 3) {
            timeOffset = oneDay + 3 * oneHour // Kecha
            progressVal = 30
          } else if (idx === 4) {
            timeOffset = oneDay + 7 * oneHour // Kecha
            progressVal = 100
          } else if (idx === 5) {
            timeOffset = 3 * oneDay // Ushbu hafta
            progressVal = 60
          } else if (idx === 6) {
            timeOffset = 5 * oneDay // Ushbu hafta
            progressVal = 20
          } else {
            timeOffset = 9 * oneDay // Avvalroq
            progressVal = 85
          }

          const watchedDate = new Date(now - timeOffset).toISOString()
          const totalDurations = ['18:40', '32:15', '45:00', '12:30', '1:05:20', '28:10', '52:45', '24:00']

          return {
            id: `seed-${playlist.id}-${idx}`,
            playlistId: playlist.id,
            title: playlist.title,
            thumbnail: playlist.thumbnail,
            channelTitle: playlist.channel?.name || 'Muallif',
            channelAvatar: playlist.channel?.avatar,
            channelVerified: playlist.channel?.verified,
            price: playlist.price,
            coins: playlist.rawPrice ? Math.round(playlist.rawPrice / 1000) : undefined,
            watchedAt: watchedDate,
            progress: progressVal,
            duration: totalDurations[idx % totalDurations.length],
            totalLessons: playlist.videoCount || playlist.videos?.length || 1,
            category: playlist.category || 'Dasturlash',
            rawPlaylist: playlist,
          }
        })

        set({ history: mockHistory })
      },
    }),
    {
      name: 'c2c_watch_history_v1',
    }
  )
)
