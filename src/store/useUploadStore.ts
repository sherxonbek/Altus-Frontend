import { create } from 'zustand'
import { uploadApi } from '../api/upload.api'
import { useUserVideoStore } from './useUserVideoStore'
import type { UserChannel } from './useChannelStore'

export interface UploadTask {
  id: string
  title: string
  description?: string
  thumbnail?: string
  videoUrl?: string
  file?: File
  duration?: string
  fileSize?: number
  channelId: string
  channel: UserChannel
  targetPlaylistId: string // 'new' yoki mavjud playlist ID
  newPlaylistTitle?: string
  newPlaylistPrice?: string
  progress: number
  statusText: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  startedAt: number
}

export interface StartUploadPayload {
  title: string
  description?: string
  thumbnail?: string
  videoUrl?: string
  file?: File | null
  duration?: string
  fileSize?: number
  channel: UserChannel
  targetPlaylistId: string
  newPlaylistTitle?: string
  newPlaylistPrice?: string
}

interface UploadState {
  tasks: UploadTask[]
  activeTaskId: string | null
  startUpload: (payload: StartUploadPayload) => string
  cancelUpload: (taskId: string) => void
  dismissTask: (taskId: string) => void
}

export const useUploadStore = create<UploadState>((set, get) => ({
  tasks: [],
  activeTaskId: null,

  startUpload: (payload: StartUploadPayload) => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const newTask: UploadTask = {
      id: taskId,
      title: payload.title.trim(),
      description: payload.description?.trim(),
      thumbnail: payload.thumbnail,
      videoUrl: payload.videoUrl,
      file: payload.file || undefined,
      duration: payload.duration,
      fileSize: payload.fileSize || (payload.file ? payload.file.size : undefined),
      channelId: payload.channel.id,
      channel: payload.channel,
      targetPlaylistId: payload.targetPlaylistId,
      newPlaylistTitle: payload.newPlaylistTitle?.trim(),
      newPlaylistPrice: payload.newPlaylistPrice?.trim(),
      progress: 0,
      statusText: 'Yuklash boshlanmoqda...',
      status: 'uploading',
      startedAt: Date.now(),
    }

    set((state) => ({
      tasks: [newTask, ...state.tasks],
      activeTaskId: taskId,
    }))

    // Asinxron yuklash jarayonini orqa fonda ishga tushirish (modal yoki sahifa yopilsa ham davom etadi)
    ;(async () => {
      try {
        let finalVideoUrl = payload.videoUrl?.trim() || ''

        // 1. Agar fayl bo'lsa server/Kinescope ga yuklash
        if (payload.file) {
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? { ...t, statusText: 'Video serverga uzatilmoqda...' }
                : t
            ),
          }))

          finalVideoUrl = await uploadApi.uploadVideo(
            payload.file,
            (percent, statusText) => {
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === taskId
                    ? {
                        ...t,
                        progress: percent,
                        statusText: statusText || `Yuklanmoqda: ${percent}%`,
                      }
                    : t
                ),
              }))
            },
            payload.title.trim()
          )
        }

        // 2. Qayta ishlash va playlistga bog'lash
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  progress: 100,
                  status: 'processing',
                  statusText: 'Playlistga saqlanmoqda...',
                }
              : t
          ),
        }))

        let finalPlaylistId: string | number = payload.targetPlaylistId

        // Yangi playlist yaratish kerak bo'lsa
        if (payload.targetPlaylistId === 'new') {
          const parsedPrice = payload.newPlaylistPrice?.trim()
            ? parseInt(payload.newPlaylistPrice.replace(/\D/g, ''), 10) || 0
            : 0

          const created = await useUserVideoStore.getState().createPlaylist(payload.channel, {
            title: payload.newPlaylistTitle?.trim() || payload.title.trim(),
            totalPrice: parsedPrice,
          })

          if (!created) {
            throw new Error('Playlist yaratishda xatolik yuz berdi')
          }
          finalPlaylistId = created.id
        }

        // Videoni playlistga biriktirish
        await useUserVideoStore.getState().addVideoToPlaylist(payload.channel.id, finalPlaylistId, {
          title: payload.title.trim(),
          description: payload.description?.trim() || undefined,
          videoUrl: finalVideoUrl,
          thumbnail: payload.thumbnail || undefined,
          duration: payload.duration || undefined,
          fileSize: payload.fileSize || (payload.file ? payload.file.size : undefined),
        })

        // Barcha playlistlarni bazadan yangilash
        await useUserVideoStore.getState().loadUserPlaylists(payload.channel.id)

        // Muvaffaqiyatli yakunlandi
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  progress: 100,
                  status: 'completed',
                  statusText: 'Muvaffaqiyatli yuklandi!',
                }
              : t
          ),
        }))

        // 4 soniyadan so'ng taskni ro'yxatdan chiqarish
        setTimeout(() => {
          get().dismissTask(taskId)
        }, 4000)
      } catch (err: any) {
        console.error('Background upload error:', err)
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: 'error',
                  error: err?.message || 'Yuklashda xatolik yuz berdi',
                  statusText: 'Yuklashda xatolik yuz berdi',
                }
              : t
          ),
        }))
      }
    })()

    return taskId
  },

  cancelUpload: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
    }))
  },

  dismissTask: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
    }))
  },
}))
