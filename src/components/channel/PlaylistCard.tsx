import { ListVideo, Plus, Edit3, Trash2 } from 'lucide-react'
import type { CoursePlaylist } from '../../types'
import { formatPrice } from '../../store/useUserVideoStore'

interface PlaylistCardProps {
  playlist: CoursePlaylist
  onSelect: () => void
  onAddVideo: () => void
  onEdit: () => void
  onDelete: () => void
}

export const PlaylistCard = ({
  playlist,
  onSelect,
  onAddVideo,
  onEdit,
  onDelete,
}: PlaylistCardProps) => {
  const perVideoPrice =
    playlist.videos.length > 0 && playlist.rawPrice
      ? Math.round(playlist.rawPrice / playlist.videos.length)
      : 0

  return (
    <div className="group flex flex-col bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300">
      {/* Playlist muqovasi */}
      <div
        onClick={onSelect}
        className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800 cursor-pointer"
      >
        <img
          src={playlist.thumbnail}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Nechta video borligi burchak qoplamasi */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-28 bg-gradient-to-l from-black/90 via-black/60 to-transparent flex flex-col items-center justify-center text-white px-2">
          <ListVideo className="w-6 h-6 mb-1 text-indigo-300 drop-shadow-md" />
          <span className="font-extrabold text-base leading-tight drop-shadow-md">
            {playlist.videos.length}
          </span>
          <span className="text-[10px] text-zinc-300 font-medium">dars</span>
        </div>

        {/* Narxi burchak nishoni */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold shadow-md">
          {playlist.price}
        </div>
      </div>

      {/* Playlist ma'lumotlari */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            onClick={onSelect}
            className="font-bold text-base text-gray-900 dark:text-zinc-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer"
            title={playlist.title}
          >
            {playlist.title}
          </h3>
        </div>

        {/* Narx taqsimoti ma'lumoti */}
        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-zinc-400">Har bir video narxi:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {playlist.videos.length > 0
              ? perVideoPrice > 0
                ? formatPrice(perVideoPrice)
                : 'Bepul'
              : 'Videolar hali yo\'q'}
          </span>
        </div>

        {/* Amallar: Ko'rish, Video qo'shish, Edit, Delete */}
        <div className="pt-2 mt-auto flex items-center justify-between gap-2 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onSelect}
            className="flex-1 py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer text-center"
          >
            Darslar ({playlist.videos.length})
          </button>

          <button
            type="button"
            onClick={onAddVideo}
            title="Ushbu playlistga yangi video qo'shish"
            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onEdit}
            title="Playlistni tahrirlash (Title, Narx)"
            className="p-2 text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Playlistni o'chirish"
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
