import { useState, useEffect } from 'react'
import { Plus, Film } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChannelStore } from '../store/useChannelStore'
import { useUserVideoStore } from '../store/useUserVideoStore'
import type { CoursePlaylist, CourseLesson } from '../types'
import { CourseDetail } from '../components/video/CourseDetail'
import {
  ChannelAuthPrompt,
  ChannelHeader,
  ChannelForm,
  PlaylistCard,
  UploadingCard,
  UploadVideoModal,
  EditPlaylistModal,
  EditVideoModal,
} from '../components/channel'
import { useUploadStore } from '../store/useUploadStore'
import type { PageType } from '../components/layout'

interface MyChannelPageProps {
  onNavigate?: (page: PageType) => void
}

export const MyChannelPage = ({ onNavigate }: MyChannelPageProps) => {
  const { isAuthenticated, user, openAuthModal } = useAuthStore()
  const { currentChannel, loadUserChannel } = useChannelStore()
  const { tasks } = useUploadStore()
  const {
    playlists,
    loadUserPlaylists,
    deleteVideo,
    deletePlaylist,
  } = useUserVideoStore()

  // Holatlar: tanlangan playlist, modallar
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | number | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>('new')
  const [editingPlaylist, setEditingPlaylist] = useState<CoursePlaylist | null>(null)
  const [editingVideoInfo, setEditingVideoInfo] = useState<{
    playlistId: string | number
    video: CourseLesson
  } | null>(null)

  const channelId = currentChannel?.id || (currentChannel as any)?._id?.toString()
  const userId = user?.id || (user as any)?._id?.toString()

  // Foydalanuvchi kanalini va playlistlarini yuklash
  useEffect(() => {
    if (userId) {
      loadUserChannel(userId)
    }
  }, [userId, loadUserChannel])

  useEffect(() => {
    if (channelId) {
      loadUserPlaylists(channelId)
    }
  }, [channelId, loadUserPlaylists])

  // 1. Agar foydalanuvchi tizimga kirmagan bo'lsa
  if (!isAuthenticated || !user) {
    return (
      <ChannelAuthPrompt
        onLogin={() => openAuthModal('login')}
        onHome={() => onNavigate?.('home')}
      />
    )
  }

  // 2. Agar kanal hali yaratilmagan bo'lsa
  if (!currentChannel) {
    return (
      <ChannelForm
        isEditing={false}
        onCancel={() => onNavigate?.('home')}
        onSuccess={() => {
          if (userId) {
            loadUserChannel(userId)
          }
        }}
      />
    )
  }

  // Jami videolar soni
  const totalVideos = playlists.reduce((acc, p) => acc + p.videos.length, 0)

  // 3. Tanlangan playlistni to'liq tomosha qilish (CourseDetail orqali)
  const activePlaylist = playlists.find((p) => String(p.id) === String(selectedPlaylistId))
  if (activePlaylist) {
    return (
      <CourseDetail
        courseId={activePlaylist.id}
        customCourse={activePlaylist}
        isOwner={true}
        onBack={() => setSelectedPlaylistId(null)}
        onAddVideo={() => {
          setTargetPlaylistId(String(activePlaylist.id))
          setIsUploadModalOpen(true)
        }}
        onEditPlaylist={() => setEditingPlaylist(activePlaylist)}
        onEditVideo={(video) =>
          setEditingVideoInfo({ playlistId: activePlaylist.id, video })
        }
        onDeleteVideo={(video) => {
          if (confirm("Ushbu videoni o'chirmoqchimisiz?")) {
            deleteVideo(channelId, activePlaylist.id, video.id)
          }
        }}
      />
    )
  }

  const handleDeletePlaylist = (playlistId: string | number) => {
    if (!channelId) return
    if (confirm("Ushbu playlist va undagi barcha videolarni o'chirmoqchimisiz?")) {
      deletePlaylist(channelId, playlistId)
      if (String(selectedPlaylistId) === String(playlistId)) {
        setSelectedPlaylistId(null)
      }
    }
  }

  const activeChannelUploads = channelId
    ? tasks.filter((t) => t.channelId === channelId)
    : []
  const hasItems = playlists.length > 0 || activeChannelUploads.length > 0
  const totalDisplayCount = playlists.length + activeChannelUploads.length

  // 4. Asosiy Kanal sahifasi
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      {/* Profil Headeri */}
      <ChannelHeader
        channel={currentChannel}
        playlistsCount={totalDisplayCount}
        totalVideosCount={totalVideos}
        onEditChannel={() => onNavigate?.('settings')}
        onUploadVideo={() => {
          setTargetPlaylistId(playlists.length > 0 ? String(playlists[0].id) : 'new')
          setIsUploadModalOpen(true)
        }}
      />

      {/* Playlistlar va Videolar */}
      <div className="space-y-5">
        {!hasItems ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Hozircha yuklangan videolariz mavjud emas
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                Kanalga birinchi playlistingiz va videongizni yuklang hamda tomoshabinlaringiz bilan bilimlaringizni ulashing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTargetPlaylistId('new')
                setIsUploadModalOpen(true)
              }}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Birinchi videoni yuklash</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {/* Yuklanayotgan videolar birinchi bo'lib turadi */}
            {activeChannelUploads.map((task) => (
              <UploadingCard key={task.id} task={task} />
            ))}

            {/* Mavjud playlistlar */}
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onSelect={() => setSelectedPlaylistId(playlist.id)}
                onAddVideo={() => {
                  setTargetPlaylistId(String(playlist.id))
                  setIsUploadModalOpen(true)
                }}
                onEdit={() => setEditingPlaylist(playlist)}
                onDelete={() => handleDeletePlaylist(playlist.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video yuklash modali */}
      <UploadVideoModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        channel={currentChannel}
        playlists={playlists}
        initialPlaylistId={targetPlaylistId}
      />

      {/* Playlistni tahrirlash modali */}
      <EditPlaylistModal
        playlist={editingPlaylist}
        channelId={channelId}
        onClose={() => setEditingPlaylist(null)}
      />

      {/* Videoni tahrirlash modali */}
      <EditVideoModal
        videoInfo={editingVideoInfo}
        channelId={channelId}
        onClose={() => setEditingVideoInfo(null)}
      />
    </div>
  )
}
