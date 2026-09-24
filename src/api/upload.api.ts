import axios from 'axios'
import { apiClient } from './client'

export interface UploadResponse {
  success: boolean
  url: string
  provider?: 'kinescope' | 'local'
  playLink?: string
  embedLink?: string
  videoId?: string
  status?: string
  filename?: string
  originalName?: string
  size?: number
  mimetype?: string
  message?: string
}

export interface KinescopeConfigResponse {
  success: boolean
  directUpload?: boolean
  uploaderUrl?: string
  apiKey?: string
  projectId?: string
  message?: string
}

export interface UploadProgressResponse {
  success: boolean
  progress?: {
    uploadId: string
    stage: 'uploading_server' | 'uploading_kinescope' | 'done' | 'error'
    percent: number
    message: string
  }
}

export const getFullMediaUrl = (url?: string): string => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '')
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`
}

export const uploadApi = {
  /**
   * Video yuklash:
   * 1. Kinescope konfiguratsiyasi mavjud bo'lsa, brauzerdan to'g'ridan-to'g'ri Kinescope uploader v2 ga yuklaydi.
   *    Bunda onUploadProgress 0% dan 100% gacha haqiqiy baytlarning borishini 1:1 real vaqtda ko'rsatadi.
   * 2. Agar bevosita yuklashda tarmoq xatosi bo'lsa, server orqali oqimli o'tkaziladi va server progressi
   *    real vaqt rejimida polling qilinib, foiz bir xil ushlab turiladi.
   */
  uploadVideo: async (
    file: File,
    onProgress?: (percent: number, statusText?: string) => void,
    title?: string
  ): Promise<string> => {
    // 1. Kinescope konfiguratsiyasini tekshirish
    let kinescopeConfig: KinescopeConfigResponse | null = null
    try {
      const configRes = await apiClient.get<KinescopeConfigResponse>('/upload/kinescope/config')
      if (configRes.data?.success && configRes.data?.directUpload && configRes.data?.apiKey) {
        kinescopeConfig = configRes.data
      }
    } catch {
      // Config olinmasa, to'g'ridan-to'g'ri backend uploadga o'tamiz
    }

    // 2. Direct Upload (Brauzerdan Kinescope'ga to'g'ridan-to'g'ri 1-bosqichda yuklash)
    if (kinescopeConfig && kinescopeConfig.uploaderUrl && kinescopeConfig.apiKey) {
      try {
        const videoTitle = title?.trim() || file.name.replace(/\.[^/.]+$/, '')
        const headers: Record<string, string> = {
          Authorization: `Bearer ${kinescopeConfig.apiKey}`,
          'X-Video-Title': encodeURIComponent(videoTitle),
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(file.size),
        }
        if (kinescopeConfig.projectId) {
          headers['X-Parent-ID'] = kinescopeConfig.projectId
        }

        const directRes = await axios.post(kinescopeConfig.uploaderUrl, file, {
          headers,
          timeout: 1800000, // 30 daqiqa
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total && onProgress) {
              const percent = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total))
              onProgress(percent, `Video yuklanmoqda... ${percent}%`)
            }
          },
        })

        const data = directRes.data?.data
        if (data?.embed_link) {
          if (onProgress) {
            onProgress(100, 'Video muvaffaqiyatli yuklandi!')
          }
          return data.embed_link
        }
      } catch {
        // Fallback to server upload
      }
    }

    // 3. Fallback: Backend orqali yuklash va serverdagi progressni sinxron kuzatish
    const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    const formData = new FormData()
    formData.append('video', file)
    if (title) formData.append('title', title)

    let progressInterval: any = null
    let serverStage = false

    const startProgressPolling = () => {
      progressInterval = setInterval(async () => {
        try {
          const pollRes = await apiClient.get<UploadProgressResponse>(`/upload/progress/${uploadId}`)
          const info = pollRes.data?.progress
          if (info && info.percent > 0 && onProgress) {
            // Server yuklash bosqichi (50% - 99%)
            const mappedPercent = Math.min(99, 50 + Math.round((info.percent * 49) / 100))
            onProgress(
              mappedPercent,
              info.message || `Video yuklanmoqda: ${info.percent}%`
            )
          }
        } catch {
          // ignore
        }
      }, 400)
    }

    try {
      const res = await apiClient.post<UploadResponse>('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-upload-id': uploadId,
        },
        timeout: 1800000, // 30 daqiqa
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress && !serverStage) {
            const clientPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            if (clientPercent < 100) {
              const halfPercent = Math.round(clientPercent * 0.5)
              onProgress(halfPercent, `Fayl serverga uzatilmoqda... ${clientPercent}%`)
            } else {
              serverStage = true
              onProgress(50, 'Video qayta ishlanmoqda...')
              startProgressPolling()
            }
          }
        },
      })

      if (progressInterval) clearInterval(progressInterval)

      if (res.data.success && res.data.url) {
        if (onProgress) {
          onProgress(100, 'Video muvaffaqiyatli saqlandi!')
        }
        return getFullMediaUrl(res.data.url)
      }

      throw new Error(res.data.message || 'Video yuklashda xatolik yuz berdi')
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval)
      throw err
    }
  },

  uploadThumbnail: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('thumbnail', file)

    const res = await apiClient.post<UploadResponse>('/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    })

    if (res.data.success && res.data.url) {
      return getFullMediaUrl(res.data.url)
    }

    throw new Error(res.data.message || 'Rasm yuklashda xatolik yuz berdi')
  },
}
