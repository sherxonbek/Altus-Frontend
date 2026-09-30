import { Home, Bookmark, History, User, UploadCloud } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import type { PageType } from './Sidebar'

interface BottomNavProps {
  activePage: PageType
  onNavigate: (page: PageType) => void
  onOpenLogin: () => void
  onUploadClick: () => void
}

export const BottomNav = ({ activePage, onNavigate, onOpenLogin, onUploadClick }: BottomNavProps) => {
  const { isAuthenticated, user } = useAuthStore()

  const navItems = [
    {
      id: 'home',
      label: 'Bosh sahifa',
      icon: Home,
      action: () => onNavigate('home')
    },
    {
      id: 'saved',
      label: 'Saqlanganlar',
      icon: Bookmark,
      action: () => onNavigate('saved')
    },
    {
      id: 'upload',
      isUpload: true,
      action: onUploadClick
    },
    {
      id: 'history',
      label: 'Tarix',
      icon: History,
      action: () => onNavigate('history')
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      action: () => {
        if (isAuthenticated) {
          onNavigate('profile')
        } else {
          onOpenLogin()
        }
      },
      avatar: isAuthenticated && user?.avatar ? user.avatar : undefined
    }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-gray-200/90 dark:border-zinc-800/90 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] px-2 py-1.5 flex items-center justify-around h-16 pb-[calc(env(safe-area-inset-bottom,0px))]">
      {navItems.map((item) => {
        if (item.isUpload) {
          return (
            <div key="upload-btn" className="flex flex-col items-center justify-center w-[4.5rem] h-full">
              <button
                type="button"
                onClick={item.action}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transform transition-transform active:scale-95"
              >
                <UploadCloud className="w-6 h-6" />
              </button>
            </div>
          )
        }

        const isActive = activePage === item.id || (item.id === 'profile' && activePage === 'profile' && isAuthenticated)
        const Icon = item.icon!
        
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            className={`flex flex-col items-center justify-center w-[4.5rem] h-full gap-1 transition-colors cursor-pointer ${
              isActive 
                ? 'text-indigo-600 dark:text-indigo-400 font-bold' 
                : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
            }`}
          >
            {item.avatar ? (
              <img 
                src={item.avatar} 
                alt="Profil" 
                className={`w-6 h-6 rounded-full object-cover border-2 ${isActive ? 'border-indigo-600 dark:border-indigo-400' : 'border-transparent'}`}
              />
            ) : (
              <Icon className={`w-6 h-6 ${isActive ? 'fill-indigo-600/10' : ''}`} />
            )}
            <span className="text-[11px] truncate w-full text-center">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
