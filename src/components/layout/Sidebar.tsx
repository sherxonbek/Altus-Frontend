import {
  Home,
  Download,
  Bookmark,
  History,
  Tv2,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useSubscriptionStore } from '../../store/useSubscriptionStore'

export type PageType = 'home' | 'subscriptions' | 'saved' | 'history' | 'channel' | 'settings'

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
  onOpenLogin?: () => void
  onOpenRegister?: () => void
  activePage?: PageType
  onNavigate?: (page: PageType) => void
}

export const Sidebar = ({
  isOpen,
  activePage = 'home',
  onNavigate,
}: SidebarProps) => {
  const { isAuthenticated, user, logout, openAuthModal } = useAuthStore()
  const { subscriptions: storeSubscriptions, selectedChannelId, setSelectedChannelId } = useSubscriptionStore()

  // Ro'yxatdan o'tmagan yoki tizimga kirmagan bo'lsa obunalar mutlaqo bo'sh bo'ladi
  const subscriptions = isAuthenticated && user ? storeSubscriptions : []

  // 5 tadan ortiq bo'lsa dastlabki 5 tasini ko'rsatish
  const visibleChannels = subscriptions.slice(0, 5)
  const hasMoreChannels = subscriptions.length > 5
  const remainingCount = subscriptions.length - 5

  // Ism va familiyadan 2 ta bosh harfni qirqib olish
  const getInitials = (name?: string): string => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-all duration-300 ease-in-out shrink-0 z-30 flex flex-col ${
        isOpen
          ? 'w-60 lg:w-64 opacity-100'
          : 'w-0 opacity-0 overflow-hidden border-r-0'
      }`}
      aria-label="Asosiy menyu"
    >
      {/* Ichki konteyner qisqarganda matn buzilmasligi uchun qat'iy kenglikka ega */}
      <div className="w-60 lg:w-64 h-full flex flex-col overflow-hidden">
        {/* Aylantiriladigan ro'yxat (Scrollable Navigation) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-sm select-none scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
          {/* ================= 1-BO'LIM: ASOSIY ================= */}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => onNavigate?.('home')}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-semibold transition-colors cursor-pointer text-left ${
                activePage === 'home'
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800'
                  : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Home className={`w-5 h-5 shrink-0 ${activePage === 'home' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-zinc-400'}`} />
              <span className="truncate">Bosh sahifa</span>
            </button>

            {/* Katalog => Yuklanganlar */}
            <button
              type="button"
              onClick={() => onNavigate?.('saved')}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
                activePage === 'saved'
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800'
                  : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Download className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate">Yuklanganlar</span>
            </button>

            {/* Sevimlilar => Saqlanganlar */}
            <button
              type="button"
              onClick={() => onNavigate?.('saved')}
              className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium transition-colors cursor-pointer text-left ${
                activePage === 'saved'
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800'
                  : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Bookmark className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate">Saqlanganlar</span>
            </button>
          </div>

          <div className="my-3 border-t border-gray-200 dark:border-zinc-800" />

          {/* ================= 2-BO'LIM: OBUNALAR ================= */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              <span className="text-[11px] font-bold tracking-wider uppercase">Obunalar</span>
              {subscriptions.length > 0 && (
                <span className="text-[10px] font-semibold text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                  {subscriptions.length}
                </span>
              )}
            </div>

            {subscriptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-zinc-400 italic">
                Hozircha obunalar yo'q
              </div>
            ) : (
              <>
                {visibleChannels.map((channel) => {
                  const isSelected =
                    activePage === 'subscriptions' && selectedChannelId === channel.id
                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => {
                        setSelectedChannelId(channel.id)
                        onNavigate?.('subscriptions')
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left group ${
                        isSelected
                          ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800 font-semibold'
                          : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }`}
                      title={channel.name}
                    >
                      <img
                        src={channel.avatar}
                        alt={channel.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-gray-200 dark:ring-zinc-700"
                      />
                      <span className="truncate text-xs font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {channel.name}
                      </span>
                      {channel.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-auto" />
                      )}
                    </button>
                  )
                })}

                {/* 5 tadan ko'p bo'lsa dropdown / barchasini ko'rish tugmasi */}
                {hasMoreChannels && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedChannelId(null)
                      onNavigate?.('subscriptions')
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group cursor-pointer"
                    title="Barcha obunalarni ko'rish"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">Yana {remainingCount} ta kanal</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 shrink-0">
                      Barchasi
                    </span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="my-3 border-t border-gray-200 dark:border-zinc-800" />

          {/* ================= 3-BO'LIM: ISTORIYA VA MENING KANALIM ================= */}
          <div className="space-y-0.5">
            {/* Avtotransport => Istoriya */}
            <button
              type="button"
              onClick={() => onNavigate?.('history')}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                activePage === 'history'
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800'
                  : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <History className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate">Istoriya</span>
            </button>

            {/* Ko'chmas mulk => Mening kanalim */}
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('login')
                  return
                }
                onNavigate?.('channel')
              }}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                activePage === 'channel'
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800'
                  : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Tv2 className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate">Mening kanalim</span>
            </button>
          </div>

          <div className="my-3 border-t border-gray-200 dark:border-zinc-800" />

          {/* ================= 4-BO'LIM: SOZLAMALAR VA YORDAM ================= */}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal('login')
                  return
                }
                onNavigate?.('settings')
              }}
              className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left ${
                activePage === 'settings'
                  ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-800 font-semibold'
                  : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Settings className={`w-5 h-5 shrink-0 ${activePage === 'settings' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-zinc-400'}`} />
              <span className="truncate">Sozlamalar</span>
            </button>

            <a
              href="#help"
              className="flex items-center gap-4 px-3 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" />
              <span className="truncate">Yordam</span>
            </a>
          </div>

          {/* Pastki qism: Footer ma'lumotlari */}
          <div className="pt-3 pb-2 px-3 space-y-1 text-[11px] text-gray-400 dark:text-zinc-500">
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <a href="#about" className="hover:underline">Haqida</a>
              <a href="#terms" className="hover:underline">Qoidalar</a>
              <a href="#privacy" className="hover:underline">Maxfiylik</a>
            </div>
            <p className="font-semibold text-gray-500 dark:text-zinc-400 pt-1">
              © 2026 Altus
            </p>
          </div>
        </div>

        {/* ================= PASTKI PROFIL QISMI (AGAR TIZIMGA KIRGAN BO'LSA) ================= */}
        {isAuthenticated && user && (
          <div className="p-3 shrink-0 border-t border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-800/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(user.fullName)}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400 truncate flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    +998 {user.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Tizimdan chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
