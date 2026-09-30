import React, { useCallback } from 'react'
import {
  ListVideo,
  CheckCircle2,
  Star,
  Bookmark,
} from 'lucide-react'
import type { CoursePlaylist } from '../../types'
import { useSavedStore } from '../../store/useSavedStore'
import { useToastStore } from '../../store/useToastStore'

interface CourseCardProps {
  video: CoursePlaylist
  onSelect?: (video: CoursePlaylist) => void
}

export const VideoCard = React.memo(({ video, onSelect }: CourseCardProps) => {
  const isSaved = useSavedStore((state) =>
    state.savedPlaylists.some((item) => String(item.playlist.id) === String(video.id))
  )
  const toggleSavePlaylist = useSavedStore((state) => state.toggleSavePlaylist)
  const showToast = useToastStore((state) => state.showToast)

  const handleToggleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const res = toggleSavePlaylist(video)
      showToast(res.message, res.isSaved ? 'success' : 'info')
    },
    [video, toggleSavePlaylist, showToast]
  )

  return (
    <div
      onClick={() => onSelect?.(video)}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
    >
      {/* 1. Kurs Muqovasi (Playlist Thumbnail) va Playlist Qoplamasi */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Saqlash (Bookmark) tugmasi - chap yuqori burchakda */}
        <button
          type="button"
          onClick={handleToggleSave}
          title={isSaved ? "Saqlanganlardan olib tashlash" : "Saqlanganlarga qo'shish"}
          aria-label={isSaved ? "Saqlanganlardan olib tashlash" : "Saqlanganlarga qo'shish"}
          className={`absolute top-3 left-3 z-10 w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer active:scale-95 ${
            isSaved
              ? 'bg-indigo-600 text-white shadow-indigo-600/30'
              : 'bg-black/60 text-white/90 hover:text-white hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* O'ng tarafdagi YouTube/Edu uslubidagi Playlist qoplamasi (Nechta video borligi) */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-28 bg-gradient-to-l from-black/90 via-black/60 to-transparent flex flex-col items-center justify-center text-white px-2">
          <ListVideo className="w-6 h-6 mb-1 text-indigo-300 drop-shadow-md" />
          <span className="font-extrabold text-base leading-tight drop-shadow-md">
            {video.videoCount}
          </span>
        </div>
      </div>

      {/* 2. Kurs Tafsilotlari va Muallif Avatari */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Muallif Avatari va Sarlavha */}
        <div className="flex items-start gap-3">
          {/* Kanal / Muallif Avatari */}
          <div className="relative shrink-0 mt-0.5">
            <img
              src={video.channel.avatar}
              alt={video.channel.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Kurs Nomi */}
            <h3
              className="font-bold text-sm sm:text-base leading-snug text-gray-900 dark:text-zinc-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
              title={video.title}
            >
              {video.title}
            </h3>

            {/* Kanal nomi va reytingi */}
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-zinc-400">
              <span className="font-semibold text-gray-800 dark:text-zinc-200 truncate">
                {video.channel.name}
              </span>
              {video.channel.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600 text-white shrink-0" />
              )}
              {video.channel.rating && (
                <span className="flex items-center gap-0.5 text-amber-500 font-bold ml-auto shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {video.channel.rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

VideoCard.displayName = 'VideoCard'
