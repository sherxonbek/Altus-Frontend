import { LogIn } from 'lucide-react'

interface ChannelAuthPromptProps {
  onLogin: () => void
  onHome: () => void
}

export const ChannelAuthPrompt = ({ onLogin, onHome }: ChannelAuthPromptProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto py-16 px-4 text-center space-y-5 animate-fadeIn">
      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto shadow-md">
        <LogIn className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Mening kanalim sahifasi
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          O'z shaxsiy kanalingizni yaratish, boshqarish va darsliklar joylash uchun
          avval hisobingizga kiring.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onLogin}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
        >
          Kirish
        </button>
        <button
          type="button"
          onClick={onHome}
          className="px-5 py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
        >
          Bosh sahifa
        </button>
      </div>
    </div>
  )
}
