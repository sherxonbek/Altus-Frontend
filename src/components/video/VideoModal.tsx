import {
  X,
  Heart,
  Share2,
  CheckCircle2,
  Eye,
  ListVideo,
  TrendingUp,
  Tag,
  Star,
  Download,
} from 'lucide-react'
import type { CoursePlaylist } from '../../types'

interface VideoModalProps {
  video: CoursePlaylist | null
  onClose: () => void
}

export const VideoModal = ({ video, onClose }: VideoModalProps) => {
  if (!video) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
      {/* Modal oynasi */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[92vh]">
        {/* Yopish tugmasi */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video / Kurs Muqovasi va Tanishtiruv Playeri */}
        <div className="relative aspect-video w-full bg-black shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover opacity-90"
          />
          {/* O'rtadagi Play belgisi */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center pl-1 shadow-2xl hover:scale-110 transition-transform cursor-pointer">
              <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Playlist Badge */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white font-semibold text-xs flex items-center gap-1.5">
            <ListVideo className="w-4 h-4 text-indigo-400" />
            <span>{video.videoCount} ta video darslik</span>
          </div>
        </div>

        {/* Kurs ma'lumotlari (Pastki qismi) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-base flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                <span>{video.price}</span>
              </div>
              <button
                type="button"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
              >
                Kursga a'zo bo'lish
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
            {/* Muallif / Kanal ma'lumotlari */}
            <div className="flex items-center gap-3">
              <img
                src={video.channel.avatar}
                alt={video.channel.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {video.channel.name}
                  </span>
                  {video.channel.verified && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-600 text-white" />
                  )}
                  {video.channel.rating && (
                    <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold ml-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {video.channel.rating}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  {video.channel.subscribers || '10K'} obunachilar • {video.salesCount}
                </span>
              </div>
            </div>

            {/* Harakat tugmalari: Like, Ulashish, Offline Yuklash */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-medium text-gray-700 dark:text-zinc-200 cursor-pointer"
              >
                <Heart className="w-4 h-4 text-red-500" />
                <span>{video.likesCount}</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-medium text-gray-700 dark:text-zinc-200 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-indigo-500" />
                <span>Ulashish</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-medium text-gray-700 dark:text-zinc-200 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Yuklash</span>
              </button>
            </div>
          </div>

          {/* Eng ko'p sotilgan video qismi tavsifi */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Eng ko'p xarid qilingan dars qismi:</span>
              </span>
              <span>{video.bestSellerViews} ko'rilgan</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-800 dark:text-zinc-200 font-semibold">
              {video.bestSellerPart}
            </p>
          </div>

          {/* Kurs statistikasi va tavsifi */}
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl text-xs sm:text-sm text-gray-600 dark:text-zinc-300 space-y-2">
            <div className="flex items-center gap-6 text-xs font-semibold text-gray-900 dark:text-white">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-500" />
                {video.totalViews} umumiy ko'rishlar
              </span>
              <span className="flex items-center gap-1.5">
                <ListVideo className="w-4 h-4 text-indigo-500" />
                {video.videoCount} ta to'liq dars
              </span>
              <span>Oxirgi yangilanish: {video.lastUpdated}</span>
            </div>
            <p className="pt-1 leading-relaxed">
              Ushbu kurs professional darajaga chiqishni istaganlar uchun maxsus tayyorlangan. Barcha videolarni to'liq ko'rish va o'z bilimingizni amalda sinash uchun a'zo bo'ling.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
