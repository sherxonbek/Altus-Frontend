import { useState, useEffect, useCallback } from 'react'
import { Wallet, DollarSign, TrendingUp, CreditCard, Clock, Plus, BarChart3, Activity, Users, ThumbsUp, CheckCircle, Loader2, Tv2, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChannelStore } from '../store/useChannelStore'
import { ChannelAuthPrompt } from '../components/channel'
import type { PageType } from '../components/layout'
import { billingApi, type BillingStatsResponse } from '../api/billing.api'

interface BillingPageProps {
  onNavigate?: (page: PageType) => void
}

export const BillingPage = ({ onNavigate }: BillingPageProps) => {
  const { isAuthenticated, user, openAuthModal } = useAuthStore()
  const { currentChannel, loadUserChannel } = useChannelStore()
  
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [activeTab, setActiveTab] = useState<'courses' | 'activity'>('courses')

  const [stats, setStats] = useState<BillingStatsResponse | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [withdrawLoading, setWithdrawLoading] = useState(false)

  const userId = user?.id || (user as any)?._id?.toString()

  useEffect(() => {
    if (userId) {
      loadUserChannel(userId)
    }
  }, [userId, loadUserChannel])

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true)
      const data = await billingApi.getBillingStats(currentChannel?.id || 'my-channel')
      setStats(data)
    } catch (error) {
      console.error('Error loading billing stats', error)
    } finally {
      setLoadingStats(false)
    }
  }, [currentChannel?.id])

  useEffect(() => {
    if (currentChannel) {
      loadStats()
    }
  }, [currentChannel, loadStats])

  if (!isAuthenticated || !user) {
    return (
      <ChannelAuthPrompt
        onLogin={() => openAuthModal('login')}
        onHome={() => onNavigate?.('home')}
      />
    )
  }

  if (!currentChannel) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4 flex flex-col items-center justify-center text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/30 space-y-6">
        <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Wallet className="w-10 h-10" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Moliya bo'limidan foydalanish uchun kanal oching
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Darslar sotish, daromad topish va mablag'larni boshqarish uchun avval o'z kanalingizni yarating.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.('channel')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Kanal ochish</span>
        </button>
      </div>
    )
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawAmount || !cardNumber) return

    const amountNum = Number(withdrawAmount)
    if (amountNum <= 0) {
      alert("Summa noldan katta bo'lishi kerak")
      return
    }
    if (amountNum > balance) {
      alert("Mavjud balansdan ko'p pul yechib bo'lmaydi")
      return
    }

    try {
      setWithdrawLoading(true)
      const res = await billingApi.withdrawMoney({
        amount: amountNum,
        cardNumber
      })
      if (res.success) {
        alert(res.message || "Pul muvaffaqiyatli yechib olindi")
        setIsWithdrawModalOpen(false)
        setWithdrawAmount('')
        setCardNumber('')
        loadStats() // refresh stats
      } else {
        alert(res.message || "Xatolik yuz berdi")
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Server xatosi')
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (loadingStats && !stats) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const getInitials = (name?: string): string => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const balance = stats?.balance || 0
  const totalIncome = stats?.totalIncome || 0
  const monthIncome = stats?.monthIncome || 0
  const totalSold = stats?.totalSold || 0
  const coursesStats = stats?.courses || []
  const newSubscribers = stats?.recentSubscribers || []
  const videoLikes = stats?.recentLikes || []

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => onNavigate?.('profile')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Orqaga</span>
        </button>
        
        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pul yechish</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
        {currentChannel.avatar ? (
          <img
            src={currentChannel.avatar}
            alt={currentChannel.title}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-gray-50 dark:ring-zinc-800 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-xl flex items-center justify-center ring-4 ring-gray-50 dark:ring-zinc-800 shrink-0">
            {getInitials(currentChannel.title)}
          </div>
        )}
        <div className="text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentChannel.title}</h2>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-600 dark:text-zinc-400">
            <span className="font-medium bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
              {currentChannel.subscribersCount || 0} obunachilar
            </span>
            <span className="font-medium bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg">
              {totalSold} xaridlar
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Mavjud balans</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {balance.toLocaleString('uz-UZ')} <span className="text-lg text-gray-500">UZS</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Jami daromad</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalIncome.toLocaleString('uz-UZ')} <span className="text-lg text-gray-500">UZS</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Bu oylik tushum</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {monthIncome.toLocaleString('uz-UZ')} <span className="text-lg text-gray-500">UZS</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
          <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Sotilgan darslar</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalSold} <span className="text-lg text-gray-500">ta</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'courses'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Kurslar tahlili
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'activity'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Obunachilar va Like'lar
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col animate-fadeIn">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Kurslar holati</h3>
          </div>
          
          {coursesStats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
              Hozircha kurslar yo'q.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-zinc-500">
                  <tr>
                    <th className="px-5 py-3 w-20">Rasm</th>
                    <th className="px-5 py-3">Nomi</th>
                    <th className="px-5 py-3">Sotilganlar soni</th>
                    <th className="px-5 py-3">Jami daromad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {coursesStats.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <img src={course.thumbnail} alt={course.title} className="w-14 h-10 object-cover rounded-md" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium">
                        {course.salesCount} ta sotuv
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                        {course.totalRevenue.toLocaleString('uz-UZ')} UZS
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* New Subscribers */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Yangi obunachilar oqimi</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-zinc-800">
              {newSubscribers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
                  Yangi obunachilar yo'q.
                </div>
              ) : newSubscribers.map((sub, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <span className="text-xs font-medium text-gray-400 w-16">{new Date(sub.subscribedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {sub.avatar ? (
                    <img src={sub.avatar} alt={sub.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-zinc-800 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-sm flex items-center justify-center ring-2 ring-gray-100 dark:ring-zinc-800 shrink-0">
                      {getInitials(sub.fullName)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-900 dark:text-white">{sub.fullName}</div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Obuna bo'ldi
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Likes */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-rose-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Videolarga bosilgan Like'lar</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-zinc-800">
              {videoLikes.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
                  Like'lar yo'q.
                </div>
              ) : videoLikes.map((like: any, i: number) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  {like.thumbnail ? (
                    <img src={like.thumbnail} alt={like.videoName || 'Video'} className="w-14 h-10 object-cover rounded-md shrink-0" />
                  ) : (
                    <div className="w-14 h-10 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 shrink-0">
                      <Tv2 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{like.videoName || 'Video nomi'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {like.username || 'Foydalanuvchi'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-medium">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Like bosdi 👍
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pul yechib olish</h3>
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Yopish
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Karta raqami
                </label>
                <input
                  type="text"
                  placeholder="8600 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Summa (UZS)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="100000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  Mavjud balans: {balance.toLocaleString('uz-UZ')} UZS
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {withdrawLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yechib olish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
