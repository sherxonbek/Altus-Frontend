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
