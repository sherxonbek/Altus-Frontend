import { useToastStore } from '../../store/useToastStore'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-medium transition-all duration-300 animate-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-zinc-900 text-white border-zinc-700 dark:bg-white dark:text-zinc-900 dark:border-gray-200'
              : toast.type === 'error'
              ? 'bg-red-600 text-white border-red-500'
              : toast.type === 'warning'
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-indigo-600 text-white border-indigo-500'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-indigo-200 shrink-0" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>

          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 dark:hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
