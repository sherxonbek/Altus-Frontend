import { useState } from 'react'
import { LogOut, User, Video, Users, Settings, Wallet, ChevronRight, Edit3, Plus, Tv2 } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChannelStore } from '../store/useChannelStore'
import { useSubscriptionStore } from '../store/useSubscriptionStore'
import { ChannelForm } from '../components/channel'
import type { PageType } from '../components/layout'

interface ProfilePageProps {
  onNavigate: (page: PageType) => void
  onUploadClick: () => void
}

export const ProfilePage = ({ onNavigate, onUploadClick }: ProfilePageProps) => {
  const { user, logout } = useAuthStore()
  const { currentChannel } = useChannelStore()
  const { subscriptions } = useSubscriptionStore()

  const [isEditingChannel, setIsEditingChannel] = useState(false)

  const handleLogout = () => {
    logout()
    onNavigate('home')
  }

  if (!user) return null

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 animate-fadeIn">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Profil Hub</h1>

      {/* 1. Foydalanuvchi ma'lumotlari */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-1 shrink-0">
          <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.fullName || 'Foydalanuvchi'}</h2>
          <p className="text-gray-500 dark:text-zinc-400 font-medium">{user.phone}</p>
        </div>
        <div className="sm:absolute sm:top-6 sm:right-6 flex flex-col sm:flex-row gap-2">
          {user?.role === 'admin' && (
            <button 
              onClick={() => onNavigate('admin')}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
            >
              🛡️ Admin Panel
            </button>
          )}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </div>
      </div>

      {/* 2. Kanal Bo'limi */}
      {isEditingChannel ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kanalni tahrirlash</h3>
            <button onClick={() => setIsEditingChannel(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white">Ortga</button>
          </div>
          <ChannelForm 
            isEditing={!!currentChannel} 
            onCancel={() => setIsEditingChannel(false)} 
            onSuccess={() => setIsEditingChannel(false)} 
          />
        </div>
      ) : currentChannel ? (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Tv2 className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tv2 className="w-5 h-5" />
              Mening Kanalim
            </h3>
            <div className="flex items-center gap-4 mb-6">
              {currentChannel.avatar ? (
                <img src={currentChannel.avatar} alt="Kanal" className="w-16 h-16 rounded-full object-cover ring-2 ring-white/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  {currentChannel.title[0]}
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold">{currentChannel.title}</h4>
                <p className="text-indigo-200 text-sm">@{currentChannel.username} • {currentChannel.subscribersCount} obunachi • {currentChannel.videosCount} video</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => onNavigate('channel')} className="bg-white text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">
                Kanalga o'tish
              </button>
              <button onClick={() => setIsEditingChannel(true)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" /> Tahrirlash
              </button>
              <button onClick={onUploadClick} className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5 ml-auto sm:ml-0">
                <Plus className="w-4 h-4" /> Video yuklash
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-3xl p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kanal yarating va kurslaringizni soting!</h3>
            <p className="text-gray-500 dark:text-zinc-400 mt-2 max-w-lg mx-auto">
              O'z bilimlaringizni ulashing, obunachilar yig'ing va darsliklaringiz orqali daromad topishni boshlang.
            </p>
          </div>
          <button 
            onClick={() => setIsEditingChannel(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-transform active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Kanal yaratish
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Moliya & Balans */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" /> Moliya & Balans
            </h3>
          </div>
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-1">Joriy balans</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">0 so'm</p>
          </div>
          <button onClick={() => onNavigate('billing')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group">
            <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">To'liq moliya bo'limi</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-200" />
          </button>
        </div>

        {/* 4. Obunalar va Sozlamalar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Obunalar
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Siz {subscriptions.length} ta kanalga obuna bo'lgansiz.</p>
            <button onClick={() => onNavigate('subscriptions')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group">
              <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Obunalar sahifasiga o'tish</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-200" />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" /> Sozlamalar
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Shaxsiy ma'lumotlar, parol va xavfsizlik.</p>
            <button onClick={() => onNavigate('settings')} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl transition-colors group">
              <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Sozlamalarni ochish</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-zinc-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
