import { lazy, Suspense, useEffect, useState } from 'react'
import { Navbar, Sidebar, BottomNav, type PageType } from './components/layout'
import { HomePage } from './pages/Home'
import { useAuthStore } from './store/useAuthStore'
import { GlobalUploadProgress } from './components/common/GlobalUploadProgress'
import { OfflineBanner } from './components/common/OfflineBanner'
import { ToastContainer } from './components/common/ToastContainer'
// Secondary pages lazily loaded to drastically reduce initial bundle size
const HistoryPage = lazy(() => import('./pages/History').then((m) => ({ default: m.HistoryPage })))
const SubscriptionsPage = lazy(() => import('./pages/Subscriptions').then((m) => ({ default: m.SubscriptionsPage })))
const SavedPage = lazy(() => import('./pages/Saved').then((m) => ({ default: m.SavedPage })))
const MyChannelPage = lazy(() => import('./pages/MyChannel').then((m) => ({ default: m.MyChannelPage })))
const SettingsPage = lazy(() => import('./pages/Settings').then((m) => ({ default: m.SettingsPage })))
const BillingPage = lazy(() => import('./pages/Billing').then((m) => ({ default: m.BillingPage })))
const AuthModal = lazy(() => import('./pages/auth/AuthModal').then((m) => ({ default: m.AuthModal })))
const ProfilePage = lazy(() => import('./pages/Profile').then((m) => ({ default: m.ProfilePage })))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboardPage })))
import { useChannelStore } from './store/useChannelStore'
import { useUserVideoStore } from './store/useUserVideoStore'
import { UploadVideoModal, ChannelForm } from './components/channel'
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

  const { currentChannel } = useChannelStore()
  const { playlists } = useUserVideoStore()

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false)

  // Kirish yoki ro'yxatdan o'tish oynasini ochish
  const handleOpenAuth = (mode: 'login' | 'register') => {
    openAuthModal(mode)
  }

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }
    if (currentChannel) {
      setIsUploadModalOpen(true)
    } else {
      setIsChannelModalOpen(true)
    }
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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col overflow-x-hidden">
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
          onClose={() => setIsSidebarOpen(false)}
          activePage={activePage}
          onNavigate={(page) => setActivePage(page)}
          onOpenLogin={() => handleOpenAuth('login')}
          onOpenRegister={() => handleOpenAuth('register')}
        />

        {/* O'ng tarafdagi Asosiy Sahifa (Pages) */}
        <main className="flex-1 flex flex-col px-3 sm:px-6 py-4 sm:py-6 lg:px-8 min-w-0 overflow-y-auto pb-20 md:pb-8">
          <Suspense
            fallback={
              <div className="flex-1 flex justify-center items-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            }
          >
            {activePage === 'home' && <HomePage />}
            {activePage === 'history' && <HistoryPage />}
            {activePage === 'subscriptions' && (
              <SubscriptionsPage onNavigate={(page) => setActivePage(page)} />
            )}
            {activePage === 'saved' && <SavedPage />}
            {activePage === 'channel' && (
              <MyChannelPage onNavigate={(page) => setActivePage(page)} />
            )}
            {activePage === 'billing' && (
              <BillingPage onNavigate={(page) => setActivePage(page)} />
            )}
            {activePage === 'settings' && (
              <SettingsPage onNavigate={(page) => setActivePage(page)} />
            )}
            {activePage === 'profile' && (
              <ProfilePage onNavigate={(page) => setActivePage(page)} onUploadClick={handleUploadClick} />
            )}
            {activePage === 'admin' && (
              <AdminDashboardPage onNavigate={(page) => setActivePage(page)} />
            )}
          </Suspense>
        </main>
      </div>

      {/* Mobil uchun Bottom Navigation */}
      <BottomNav 
        activePage={activePage} 
        onNavigate={(page) => setActivePage(page)} 
        onOpenLogin={() => handleOpenAuth('login')} 
        onUploadClick={handleUploadClick}
      />

      {/* 3. Tizimga kirish / Ro'yxatdan o'tish Modal oynasi (pages/auth) */}
      <Suspense fallback={null}>
        {isAuthModalOpen && !isAuthenticated && (
          <AuthModal
            isOpen={isAuthModalOpen && !isAuthenticated}
            onClose={closeAuthModal}
            authMode={authMode}
            onSwitchMode={(mode) => setAuthMode(mode)}
          />
        )}
      </Suspense>

      {/* Modallar */}
      {isUploadModalOpen && currentChannel && (
        <UploadVideoModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          channel={currentChannel}
          playlists={playlists}
        />
      )}

      {isChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsChannelModalOpen(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Kanal Yaratish</h3>
              <button onClick={() => setIsChannelModalOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold">Ortga</button>
            </div>
            <ChannelForm 
              isEditing={false} 
              onCancel={() => setIsChannelModalOpen(false)} 
              onSuccess={() => {
                setIsChannelModalOpen(false)
                setIsUploadModalOpen(true)
              }} 
            />
          </div>
        </div>
      )}

      {/* 4. Global Orqa Fonda Video Yuklash Vidjeti */}
      <GlobalUploadProgress onNavigateToChannel={() => setActivePage('channel')} />

      {/* 5. Bildirishnomalar va Oflayn holat */}
      <OfflineBanner />
      <ToastContainer />
    </div>
  )
}

export default App