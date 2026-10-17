import {
  LayoutDashboard,
  Tv2,
  CreditCard,
  Activity,
  Coins,
  ArrowLeft,
  LogOut,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

export type AdminTabType = 'overview' | 'channels' | 'withdrawals' | 'trades' | 'settings'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab: AdminTabType
  onTabChange: (tab: AdminTabType) => void
  onNavigateHome: () => void
  pendingCount?: number
  tradesCount?: number
  channelsCount?: number
}

export const AdminSidebar = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onNavigateHome,
  pendingCount = 0,
  tradesCount = 0,
  channelsCount = 0,
}: AdminSidebarProps) => {
  const { logout } = useAuthStore()

  const navItems = [
    {
      group: 'ASOSIY BOSHQARUV',
      items: [
        {
          id: 'overview' as AdminTabType,
          label: 'Umumiy Dashboard',
          description: 'Metrikalar va moliyaviy xulosa',
          icon: LayoutDashboard,
        },
        {
          id: 'channels' as AdminTabType,
          label: 'Kanallar & Foydalanuvchilar',
          description: 'Ochilgan kanallar va aʼzolar holati',
          icon: Tv2,
          badge: channelsCount > 0 ? channelsCount : undefined,
          badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300',
        },
        {
          id: 'withdrawals' as AdminTabType,
          label: 'Pul Yechish So‘rovlari',
          description: 'Arizalarni ko‘rish va tasdiqlash',
          icon: CreditCard,
          badge: pendingCount > 0 ? pendingCount : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'trades' as AdminTabType,
          label: 'Savdolar Auditi',
          description: 'Kurs va darslar savdo jurnali',
          icon: Activity,
          badge: tradesCount > 0 ? tradesCount : undefined,
          badgeColor: 'bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300',
        },
      ],
    },
    {
      group: 'TIZIM PARAMETRLARI',
      items: [
        {
          id: 'settings' as AdminTabType,
          label: 'Coin & Striming Narxlari',
          description: 'USD kursi va sifat tariflari',
          icon: Coins,
        },
      ],
    },
  ]

  const handleItemClick = (tab: AdminTabType) => {
    onTabChange(tab)
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-0 lg:h-full bg-white dark:bg-zinc-900 border-r border-gray-200/80 dark:border-zinc-800 flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 w-72 lg:w-64 ${
          isOpen
            ? 'translate-x-0 opacity-100 shadow-2xl lg:shadow-none'
            : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Admin Boshqaruv Menyusi"
      >
        {/* Mobile Header (faqat mobil qurilmalarda yopish tugmasi) */}
        <div className="lg:hidden p-4 border-b border-gray-100 dark:border-zinc-800/80 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Admin Menyu
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <div className="px-3 text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20'
                          : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100/80 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive
                              ? 'text-white'
                              : 'text-gray-400 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          }`}
                        />
                        <div className="truncate">
                          <div className="text-xs font-bold leading-tight truncate">
                            {item.label}
                          </div>
                        </div>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-gray-100 dark:border-zinc-800/80 space-y-1 bg-gray-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <span>Platformaga qaytish</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Tizimdan chiqish</span>
          </button>
        </div>
      </aside>
    </>
  )
}
