import {
  ListVideo,
  CheckCircle2,
  Star,
} from 'lucide-react'
import type { CoursePlaylist } from '../../types'

interface CourseCardProps {
  video: CoursePlaylist
  onSelect?: (video: CoursePlaylist) => void
}

export const VideoCard = ({ video, onSelect }: CourseCardProps) => {



  return (
    <div
      onClick={() => onSelect?.(video)}
      className="group flex flex-col bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl overflow-hidden hover:shadow-xl hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
    >
      {/* 1. Kurs Muqovasi (Playlist Thumbnail) va Playlist Qoplamasi */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

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
}
