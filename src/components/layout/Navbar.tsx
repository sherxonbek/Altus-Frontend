import { useState, useRef, useEffect } from 'react'
import {
  Menu,
  Search,
  Bell,
  LogOut,
  X,
  Sparkles,
  Shield,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import type { PageType } from './Sidebar'

interface NavbarProps {
  onToggleSidebar?: () => void
  onOpenLogin?: () => void
  onNavigate?: (page: PageType) => void
}

export const Navbar = ({ onToggleSidebar, onOpenLogin, onNavigate }: NavbarProps) => {
  const { isAuthenticated, user, logout } = useAuthStore()

  // Qidiruv va dropdown holatlari
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Tashqariga bosilganda dropdownlarni yopish
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false)
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Ism va familiyadan 2 ta bosh harfni qirqib olish (masalan: "Aliyev Vali" -> "AV")
  const getInitials = (name?: string): string => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* ================= CHAP TARAF: SIDEBAR TOGGLE & LOGO ================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sidebar ochib-yopish tugmasi (YouTube uslubidagi aylana tugma) */}
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-full text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer focus:outline-none"
              aria-label="Menyuni ochish"
              title="Menyu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Altus Logo (Katta va mobil ekranlarda ko'rinadi) */}
            <a
              href="/"
              className="flex items-center gap-2 select-none group"
            >
              <img
                src="/altus-logo.png"
                alt="Altus Logo"
                className="h-7 sm:h-8 w-auto object-contain dark:invert transition-transform group-hover:scale-105"
              />
            </a>
          </div>

          {/* ================= MARKAZ: SEARCH INPUT (FAQAT KATTA EKRANLAR UCHUN) ================= */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="E'lonlar, mahsulotlar va xizmatlarni qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-gray-100/90 dark:bg-zinc-800/90 hover:bg-gray-100 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl transition-all outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ================= O'NG TARAF ================= */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobil ekranda Qidiruv ikonchasi (faqat kichik ekranlarda ko'rinadi) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              aria-label="Qidirish"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Bildirishnomalar qo'ng'iroqchasi (Katta va mobil ekranlarda) */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen((prev) => !prev)}
                className="relative p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer focus:outline-none"
                aria-label="Bildirishnomalar"
              >
                <Bell className="w-5 h-5" />
                {/* Yangi xabar nuqtasi (Badge) */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-zinc-900" />
              </button>

              {/* Bildirishnomalar dropdown oynasi */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-3 px-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Bildirishnomalar
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold rounded-full">
                      1 ta yangi
                    </span>
                  </div>

                  <div className="py-3 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 flex items-start gap-2.5">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-medium text-gray-900 dark:text-zinc-200">
                          Altus platformasiga xush kelibsiz!
                        </p>
                        <p className="text-gray-500 dark:text-zinc-400 mt-0.5 text-[11px]">
                          Profilingiz muvaffaqiyatli faollashtirildi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================= PROFIL YOKI KIRISH TUGMASI (KATTA EKRANLAR UCHUN) ================= */}
            <div className="hidden md:flex items-center">
              {isAuthenticated && user ? (
                // 1. Agar foydalanuvchi tizimga kirgan bo'lsa (Avatar va Dropdown)
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer border border-gray-200 dark:border-zinc-700/80"
                  >
                    {/* Profil rasmi: agar rasm bo'lsa rasm, bo'lmasa ism/familiya bosh harflari */}
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover shadow-xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        {getInitials(user.fullName)}
                      </div>
                    )}

                  </button>

                  {/* Profil Dropdown Menyusi */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                      {/* Foydalanuvchi ma'lumoti */}
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full object-cover shadow-xs"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {getInitials(user.fullName)}
                          </div>
                        )}
                        <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                          {user.fullName}
                        </p>
                      </div>

                      {/* Menyu bandlari */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span>Mening e'lonlarim</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            onNavigate?.('settings')
                          }}
                          className="w-full px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          <span>Sozlamalar</span>
                        </button>
                      </div>

                      {/* Chiqish (Logout) */}
                      <div className="pt-1 border-t border-gray-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false)
                            logout()
                          }}
                          className="w-full px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Tizimdan chiqish</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // 2. Agar foydalanuvchi tizimga kirmagan bo'lsa ("Kirish" tugmasi)
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Kirish</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= MOBIL SEARCH INPUT QATORI (OCHILGANDA) ================= */}
        {isMobileSearchOpen && (
          <div className="md:hidden py-2.5 pb-3 border-t border-gray-100 dark:border-zinc-800 animate-fadeIn">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-gray-100 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 rounded-xl outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
