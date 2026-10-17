import { createPortal } from 'react-dom'
import { Coins, X, Sparkles, Gift, AlertCircle, Info, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

interface TopUpCoinsModalProps {
  isOpen: boolean
  onClose: () => void
  requiredCoins?: number
}

export const TopUpCoinsModal = ({
  isOpen,
  onClose,
  requiredCoins,
}: TopUpCoinsModalProps) => {
  const { user } = useAuthStore()

  if (!isOpen) return null

  const currentCoins = user?.coins || 0
  const isShortOfCoins = requiredCoins && requiredCoins > currentCoins

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dekorativ orqa fon nurlari */}
        <div className="absolute -top-14 -right-14 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Coin Hisobi
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Test Rejimi
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Mavjud hisobingiz:{' '}
                <span className="font-extrabold text-amber-500 dark:text-amber-400">
                  {currentCoins.toLocaleString()} coin
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Agar yetishmayotgan bo'lsa ogohlantirish */}
        {isShortOfCoins && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
              Bu darslikni tomosha qilish uchun{' '}
              <strong className="font-bold">{requiredCoins.toLocaleString()} coin</strong> talab etiladi.
              Sizda hozirda <strong className="font-bold">{currentCoins.toLocaleString()} coin</strong> mavjud.
            </div>
          </div>
        )}

        {/* 3. Test rejimi haqida asosiy xabar */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Balansni toʻldirish vaqtincha toʻxtatilgan</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
            Platforma ayni damda <strong>test rejimida</strong> ishlamoqda. Shuning uchun ixtiyoriy balans toʻldirish funksiyasi vaqtincha yopildi.
          </p>
        </div>

        {/* 4. 100 Coin Bonus Ma'lumoti */}
        <div className="mt-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm">
            <Gift className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>100 Coin Bepul Test Bonusi</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
            Har bir yangi roʻyxatdan oʻtgan foydalanuvchiga platformani, darsliklarni va translatsiyalarni sinab koʻrish uchun <strong>100 Coin bonus</strong> avtomatik taqdim etiladi!
          </p>
        </div>

        {/* 5. Kelgusi rejalar / Qulayliklar */}
        <div className="mt-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 space-y-1.5 text-xs text-gray-500 dark:text-zinc-400">
          <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-zinc-300">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Toʻlov tizimlari:</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Tez orada <strong>Payme, Click, Uzum Bank</strong> va xalqaro kartalar orqali rasmiy avtomatlashtirilgan toʻlovlar tizimi ishga tushiriladi.
          </p>
        </div>

        {/* 6. Tugma */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-[0.99] text-white text-sm font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tushundim</span>
          </button>
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null
}
