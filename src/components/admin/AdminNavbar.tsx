import { useState, useRef, useEffect } from 'react'
import {
  Menu,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

interface AdminNavbarProps {
  onToggleSidebar: () => void
  onNavigateHome: () => void
}

export const AdminNavbar = ({
  onToggleSidebar,
  onNavigateHome,
}: AdminNavbarProps) => {
  const { user, logout } = useAuthStore()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Chap qism: Menyu tugmasi va Bosh Admin */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Admin menyusini ochish/yopish"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">
              Bosh Admin
            </span>
          </div>
        </div>

        {/* O'ng qism: Faqat Admin Profili */}
        <div className="flex items-center gap-2.5">
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.fullName?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {user?.fullName || 'Administrator'}
                </div>
                <div className="text-[10px] text-gray-400 leading-tight">Admin</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>

            {/* Dropdown menyu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {user?.fullName || 'Administrator'}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    {user?.phone}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    Bosh Administrator
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      onNavigateHome()
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                    <span>Platformaga qaytish</span>
                  </button>

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
        </div>
      </div>
    </header>
  )
}
