import { useEffect, useState } from 'react'
import { Navbar, Sidebar, type PageType } from './components/layout'
import {
  HomePage,
  HistoryPage,
  SubscriptionsPage,
  SavedPage,
  MyChannelPage,
  SettingsPage,
  AuthModal,
} from './pages'
import { useAuthStore } from './store/useAuthStore'
import { GlobalUploadProgress } from './components/common/GlobalUploadProgress'

function App() {
  const [activePage, setActivePage] = useState<PageType>('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const {
    isAuthenticated,
    isLoading,
    checkAuth,
    isAuthModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    setAuthMode,
  } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Kirish yoki ro'yxatdan o'tish oynasini ochish
  const handleOpenAuth = (mode: 'login' | 'register') => {
    openAuthModal(mode)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
        <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 animate-pulse">
          Yuklanmoqda...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col">
      {/* 1. Yuqori Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenLogin={() => handleOpenAuth('login')}
        onNavigate={(page) => setActivePage(page)}
      />

      {/* 2. Asosiy qism: Sidebar va Sahifalar (pages) yonma-yon */}
      <div className="flex-1 flex w-full">
        {/* Chap tarafdagi Docked Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenRegister={() => handleOpenAuth('register')}
        />

        {/* O'ng tarafdagi Asosiy Sahifa (Pages) */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activePage === 'home' && <HomePage />}
          {activePage === 'history' && <HistoryPage />}
          {activePage === 'subscriptions' && (
            <SubscriptionsPage onNavigate={(page) => setActivePage(page)} />
          )}
          {activePage === 'saved' && <SavedPage />}
          {activePage === 'channel' && (
            <MyChannelPage onNavigate={(page) => setActivePage(page)} />
          )}
          {activePage === 'settings' && (
            <SettingsPage onNavigate={(page) => setActivePage(page)} />
          )}
        </main>
      </div>

      {/* 3. Tizimga kirish / Ro'yxatdan o'tish Modal oynasi (pages/auth) */}
      <AuthModal
        isOpen={isAuthModalOpen && !isAuthenticated}
        onClose={closeAuthModal}
        authMode={authMode}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      {/* 4. Global Orqa Fonda Video Yuklash Vidjeti */}
      <GlobalUploadProgress onNavigateToChannel={() => setActivePage('channel')} />
    </div>
  )
}

export default App