import {
  Users,
  CheckCircle2,
  UserMinus,
} from 'lucide-react'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { useAuthStore } from '../store/useAuthStore'
import type { PageType } from '../components/layout'

interface SubscriptionsPageProps {
  onNavigate?: (page: PageType) => void
}

export const SubscriptionsPage = ({ onNavigate }: SubscriptionsPageProps) => {
  const { isAuthenticated, user, openAuthModal } = useAuthStore()
  const { subscriptions: storeSubscriptions, unsubscribe } = useSubscriptionStore()

  // Ro'yxatdan o'tmagan yoki tizimga kirmagan bo'lsa obunalar bo'sh bo'ladi
  const subscriptions = isAuthenticated && user ? storeSubscriptions : []

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Sarlavha */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Obunalar
          </h1>
          {subscriptions.length > 0 && (
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
              {subscriptions.length} ta
            </span>
          )}
        </div>
      </div>

      {/* Agar hech qanday obuna bo'lmasa yoki tizimga kirmagan bo'lsa */}
      {subscriptions.length === 0 ? (
        <div className="py-16 px-4 bg-gray-50/60 dark:bg-zinc-900/50 border border-dashed border-gray-300 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Hozircha hech qanday kanalga obuna bo'lmadingiz
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
              Qiziqarli darsliklarni kuzatib borish uchun mualliflar va kanallarga obuna bo'ling.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Hisobga kirish
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer"
            >
              Bosh sahifaga o'tish
            </button>
          </div>
        </div>
      ) : (
        /* Kanal obunalari: Faqat dumaloq avatar, kanal title + username, obunani bekor qilish */
        <div className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs overflow-hidden">
          {subscriptions.map((channel) => (
            <div
              key={channel.id}
              className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors"
            >
              {/* Dumaloq avatar va Kanal title + Username */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <img
                  src={channel.avatar}
                  alt={channel.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 ring-2 ring-gray-100 dark:ring-zinc-800 shadow-xs"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                      {channel.name}
                    </h3>
                    {channel.verified && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
                    {channel.username || `@${channel.id}`}
                  </p>
                </div>
              </div>

              {/* Faqat: Obunani bekor qilish tugmasi */}
              <button
                type="button"
                onClick={() => unsubscribe(channel.id)}
                className="px-3.5 sm:px-4 py-2 text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5 border border-gray-200 dark:border-zinc-700"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Obunani bekor qilish</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
