import { X } from 'lucide-react'
import { Login, Register } from '../../components/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  authMode: 'login' | 'register'
  onSwitchMode: (mode: 'login' | 'register') => void
}

export const AuthModal = ({
  isOpen,
  onClose,
  authMode,
  onSwitchMode,
}: AuthModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        {/* Modalni yopish tugmasi */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Kirish / Ro'yxatdan o'tish Tablari */}
        <div className="flex justify-center mb-6 pt-2">
          <div className="p-1 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center">
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Kirish
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>
        </div>

        {/* Auth shakli */}
        {authMode === 'login' ? (
          <Login onSwitchToRegister={() => onSwitchMode('register')} />
        ) : (
          <Register />
        )}
      </div>
    </div>
  )
}
