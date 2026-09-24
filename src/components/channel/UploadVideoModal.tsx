import { useState, useEffect } from 'react'
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  FolderPlus,
} from 'lucide-react'
import type { CoursePlaylist } from '../../types'
import type { UserChannel } from '../../store/useChannelStore'
import { useUserVideoStore } from '../../store/useUserVideoStore'

interface UploadVideoModalProps {
  isOpen: boolean
  onClose: () => void
  channel: UserChannel
  playlists: CoursePlaylist[]
  initialPlaylistId?: string
}

export const UploadVideoModal = ({
  isOpen,
  onClose,
  channel,
  playlists,
  initialPlaylistId = 'new',
}: UploadVideoModalProps) => {
  const { createPlaylist, addVideoToPlaylist } = useUserVideoStore()

  const [targetPlaylistId, setTargetPlaylistId] = useState<string>(initialPlaylistId)
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [newPlaylistPrice, setNewPlaylistPrice] = useState('')

  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadVideoUrl, setUploadVideoUrl] = useState('')
  const [uploadThumbnail, setUploadThumbnail] = useState('')
  const [uploadDuration, setUploadDuration] = useState('')
  const [uploadFileSize, setUploadFileSize] = useState<number | undefined>(undefined)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTargetPlaylistId(initialPlaylistId)
      setUploadError('')
      setUploadSuccess('')
    }
  }, [isOpen, initialPlaylistId])

  if (!isOpen) return null

  // Video faylini tanlash
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setUploadVideoUrl(url)
    setUploadFileSize(file.size)

    if (!uploadTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '')
      setUploadTitle(cleanName)
    }

    try {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.src = url
      v.muted = true
      v.playsInline = true
      v.onloadeddata = () => {
        v.currentTime = 1
      }
      v.onseeked = () => {
        const canvas = document.createElement('canvas')
        canvas.width = v.videoWidth || 640
        canvas.height = v.videoHeight || 360
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
          setUploadThumbnail(canvas.toDataURL('image/jpeg', 0.8))
        }
      }
    } catch {
      // ignore
    }
  }

  // Video yuklash funksiyasi
  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')
    setUploadSuccess('')

    if (targetPlaylistId === 'new') {
      if (!newPlaylistTitle.trim()) {
        setUploadError('Playlist nomini (title) kiritish majburiy.')
        return
      }
    } else if (!targetPlaylistId) {
      setUploadError('Iltimos, playlistni tanlang yoki yangi playlist yarating.')
      return
    }

    if (!uploadVideoUrl.trim()) {
      setUploadError('Video yuklash majburiy (fayl tanlang yoki havola kiriting).')
      return
    }

    if (!uploadTitle.trim()) {
      setUploadError('Video sarlavhasi (title) majburiy.')
      return
    }

    let finalPlaylistId: string | number = targetPlaylistId

    if (targetPlaylistId === 'new') {
      const parsedPrice = newPlaylistPrice.trim()
        ? parseInt(newPlaylistPrice.replace(/\D/g, ''), 10) || 0
        : 0

      const created = await createPlaylist(channel, {
        title: newPlaylistTitle.trim(),
        totalPrice: parsedPrice,
      })
      if (created) {
        finalPlaylistId = created.id
      }
    }

    await addVideoToPlaylist(channel.id, finalPlaylistId, {
      title: uploadTitle.trim(),
      description: uploadDescription.trim() || undefined,
      videoUrl: uploadVideoUrl.trim(),
      thumbnail: uploadThumbnail || undefined,
      duration: uploadDuration || undefined,
      fileSize: uploadFileSize || undefined,
    })

    setUploadSuccess('Video muvaffaqiyatli yuklandi!')
    setTimeout(() => {
      setUploadTitle('')
      setUploadDescription('')
      setUploadVideoUrl('')
      setUploadThumbnail('')
      setUploadDuration('')
      setUploadFileSize(undefined)
      setNewPlaylistTitle('')
      setNewPlaylistPrice('')
      setUploadSuccess('')
      onClose()
    }, 500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scaleUp max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Upload className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Video yuklash
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleUploadVideo} className="p-6 space-y-4 overflow-y-auto flex-1">
          {uploadError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 rounded-xl text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {/* 1. PLAYLIST TANLASH YOKI YANGI YARATISH */}
          <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <label className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <FolderPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Playlist tanlash</span>
            </label>

            {playlists.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetPlaylistId(String(playlists[0].id))}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    targetPlaylistId !== 'new'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  Mavjud playlist
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPlaylistId('new')}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    targetPlaylistId === 'new'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700'
                  }`}
                >
                  + Yangi playlist
                </button>
              </div>
            )}

            {/* Mavjud playlistlar ro'yxati */}
            {playlists.length > 0 && targetPlaylistId !== 'new' && (
              <div className="space-y-1.5">
                <select
                  value={targetPlaylistId}
                  onChange={(e) => setTargetPlaylistId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                >
                  {playlists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.videos.length} ta dars • {p.price})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Yangi playlist yaratish formasi */}
            {(targetPlaylistId === 'new' || playlists.length === 0) && (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    Playlist nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: JavaScript darslari"
                    value={newPlaylistTitle}
                    onChange={(e) => setNewPlaylistTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    Playlist umumiy sotish summasi (so'm)
                  </label>
                  <input
                    type="text"
                    placeholder="Masalan: 100 000 (0 bo'lsa Bepul)"
                    value={newPlaylistPrice}
                    onChange={(e) => setNewPlaylistPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Ushbu summa playlistdagi barcha videolarga teng taqsimlanadi.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. VIDEO FAYLI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                Video <span className="text-red-500">*</span>
              </label>
              {uploadVideoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadVideoUrl('')
                    setUploadThumbnail('')
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                >
                  Boshqa video tanlash
                </button>
              )}
            </div>

            {uploadVideoUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-gray-200 dark:border-zinc-800 flex items-center justify-center">
                <video
                  src={uploadVideoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl cursor-pointer bg-gray-50/60 dark:bg-zinc-800/40 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-200">
                    Video faylini tanlang
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                    MP4, WebM, MOV
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
                  <span className="text-[11px] text-gray-400 dark:text-zinc-500">yoki havola orqali</span>
                  <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
                </div>

                <input
                  type="url"
                  placeholder="Video havolasi (URL)..."
                  value={uploadVideoUrl}
                  onChange={(e) => {
                    setUploadVideoUrl(e.target.value)
                    if (!uploadTitle.trim() && e.target.value) {
                      setUploadTitle('Yangi video')
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
                />
              </div>
            )}
          </div>

          {/* 3. VIDEO TITLE */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              Title (Video nomi) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Video sarlavhasini kiriting..."
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all"
            />
          </div>

          {/* 4. VIDEO DISCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
              Discription (Video tavsifi)
            </label>
            <textarea
              rows={3}
              placeholder="Video haqida tavsif yozing..."
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Tugmalar */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={!uploadTitle.trim() || !uploadVideoUrl.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Yuklash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
