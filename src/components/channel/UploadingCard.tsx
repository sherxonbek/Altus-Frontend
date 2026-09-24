import { Loader2, AlertCircle, CheckCircle2, X, ListVideo } from 'lucide-react'
import type { UploadTask } from '../../store/useUploadStore'
import { useUploadStore } from '../../store/useUploadStore'

interface UploadingCardProps {
  task: UploadTask
}

export const UploadingCard = ({ task }: UploadingCardProps) => {
  const { cancelUpload, dismissTask } = useUploadStore()

  const isCompleted = task.status === 'completed'
  const isError = task.status === 'error'

  const displayTitle = task.newPlaylistTitle || task.title
  const subTitle = task.newPlaylistTitle ? `1-dars: ${task.title}` : task.description

  const coverImage =
    task.thumbnail ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop'

  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900 border-2 border-dashed border-indigo-500/50 dark:border-indigo-500/40 rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/5 transition-all duration-300 animate-fadeIn">
      {/* Playlist / Video muqovasi (qoplama) */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950 flex items-center justify-center">
        <img
          src={coverImage}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-500"
        />

        {/* Ustki qora yarim shaffof nozik qoplama */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Holat nishoni (chap yuqori burchak - Qizil to'rtburchakdagi element, tegilmadi) */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center gap-1.5 z-10">
          {isCompleted ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tayyor
            </span>
          ) : isError ? (
            <span className="text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Xatolik
            </span>
          ) : (
            <span className="text-indigo-300 flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              {task.progress}%
            </span>
          )}
        </div>

        {/* O'ng yuqori: Bekor qilish / Yopish */}
        <button
          type="button"
          onClick={() => (isError || isCompleted ? dismissTask(task.id) : cancelUpload(task.id))}
          title={isError || isCompleted ? "O'chirish" : "Yuklashni bekor qilish"}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-red-600 text-white/90 hover:text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer z-20 shadow-md active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dars belgisi */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black/80 via-black/30 to-transparent flex flex-col items-center justify-center text-white px-2 pointer-events-none">
          <ListVideo className="w-5 h-5 mb-0.5 text-indigo-300 drop-shadow-md" />
          <span className="font-extrabold text-sm leading-tight drop-shadow-md">1</span>
          <span className="text-[9px] text-zinc-300 font-medium">dars</span>
        </div>

        {/* Pastki progress chizig'i */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted
                ? 'bg-emerald-500'
                : isError
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400'
            }`}
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Kartochka ma'lumotlari: faqat sarlavha va video nomi */}
      <div className="p-5 flex flex-col gap-1.5 flex-1 justify-center">
        <h3
          className="font-bold text-base text-gray-900 dark:text-zinc-100 line-clamp-1"
          title={displayTitle}
        >
          {displayTitle}
        </h3>
        {subTitle && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium line-clamp-1">
            {subTitle}
          </p>
        )}
        {isError && (
          <p className="text-xs text-rose-500 font-medium line-clamp-1 mt-1">
            {task.error || "Yuklashda xatolik yuz berdi"}
          </p>
        )}
      </div>
    </div>
  )
}
