import { useEffect, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import { useUploadStore } from '../../store/useUploadStore'

interface GlobalUploadProgressProps {
  onNavigateToChannel?: () => void
}

export const GlobalUploadProgress = ({ onNavigateToChannel }: GlobalUploadProgressProps) => {
  const { tasks, dismissTask } = useUploadStore()
  const [showCompletedCheck, setShowCompletedCheck] = useState(false)

  const activeTask = tasks[0]

  useEffect(() => {
    if (!activeTask) {
      setShowCompletedCheck(false)
      return
    }

    if (activeTask.status === 'completed') {
      setShowCompletedCheck(true)
      // 5 soniya turib butunlay yo'qoladi
      const timer = setTimeout(() => {
        dismissTask(activeTask.id)
        setShowCompletedCheck(false)
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setShowCompletedCheck(false)
    }
  }, [activeTask?.id, activeTask?.status, dismissTask])

  if (!activeTask) return null

  const isCompleted = activeTask.status === 'completed' || showCompletedCheck
  const isError = activeTask.status === 'error'
  const progress = Math.min(100, Math.max(0, activeTask.progress || 0))

  // Doira SVG o'lchamlari
  const size = 58
  const strokeWidth = 4
  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div
      onClick={onNavigateToChannel}
      title={`${activeTask.title} (${isCompleted ? 'Yuklandi' : `${progress}%`})`}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center cursor-pointer group animate-scaleUp select-none"
    >
      {/* Tooltip (Hover qilinganda video nomi va foizi chiqadi) */}
      <div className="absolute bottom-full mb-2 right-0 hidden group-hover:flex flex-col items-end pointer-events-none transition-all">
        <div className="px-3 py-1.5 rounded-xl bg-gray-900/90 dark:bg-black/90 text-white text-xs font-semibold backdrop-blur-md shadow-xl border border-white/10 whitespace-nowrap max-w-xs truncate">
          <span className="text-gray-300 font-normal truncate block max-w-[200px]">
            {activeTask.title}
          </span>
          <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-indigo-400 font-bold'}>
            {isCompleted ? 'Muvaffaqiyatli yuklandi ✓' : `${progress}% yuklanmoqda`}
          </span>
        </div>
      </div>

      {/* Doira korinishidagi widget */}
      <div
        className={`relative w-[58px] h-[58px] rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
          isCompleted
            ? 'bg-emerald-50 dark:bg-zinc-900 border border-emerald-500/40 shadow-emerald-500/20'
            : isError
            ? 'bg-rose-50 dark:bg-zinc-900 border border-rose-500/40 shadow-rose-500/20'
            : 'bg-white/95 dark:bg-zinc-900/95 border border-indigo-500/30 dark:border-zinc-800 shadow-indigo-500/20 backdrop-blur-md'
        }`}
      >
        {/* Doiraviy progress SVG */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0 -rotate-90 pointer-events-none"
        >
          {/* Orqa fon aylanasi */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-100 dark:text-zinc-800/80"
          />

          {/* Harakatlanuvchi progress aylanasi */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-300 ease-out ${
              isCompleted
                ? 'text-emerald-500'
                : isError
                ? 'text-rose-500'
                : 'text-indigo-600 dark:text-indigo-500'
            }`}
          />
        </svg>

        {/* Doira ichidagi ma'lumot */}
        <div className="relative z-10 flex items-center justify-center">
          {isCompleted ? (
            /* 100% bolganda ptichka (checked) chiqadi */
            <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400 stroke-[3] animate-scaleUp" />
          ) : isError ? (
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          ) : (
            /* Pragres ichida korsatilinib turadi */
            <span className="text-xs font-black text-gray-900 dark:text-white tracking-tighter">
              {progress}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
