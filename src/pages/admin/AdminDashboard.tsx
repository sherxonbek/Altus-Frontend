import { useEffect, useState, useMemo } from 'react'
import {
  TrendingUp,
  Sparkles,
  Users,
  Tv2,
  Clock,
  CreditCard,
  Activity,
  Coins,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Loader2,
  Tv,
  Check,
  X,
  ChevronRight,
  ArrowRight,
  Eye,
  Film,
  Wallet,
  Phone,
  User as UserIcon,
  Layers,
  Star,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useToastStore } from '../../store/useToastStore'
import { AdminNavbar, AdminSidebar, type AdminTabType } from '../../components/admin'
import {
  type AdminStats,
  type WithdrawalRequest,
  type TradeAudit,
  type AdminChannel,
  type AdminUser,
  getAdminStats,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getRecentTrades,
  getAdminChannels,
  getAdminUsers,
} from '../../api/admin.api'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

export function AdminDashboardPage({ onNavigate }: AdminDashboardProps) {
  const { user } = useAuthStore()
  const { showToast } = useToastStore()
  const { settings, updateSettings } = useSettingsStore()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [trades, setTrades] = useState<TradeAudit[]>([])
  const [channels, setChannels] = useState<AdminChannel[]>([])
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Layout & Navigation Tab
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<AdminTabType>('overview')

  // Channels state
  const [channelSearch, setChannelSearch] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<AdminChannel | null>(null)
  const [channelViewMode, setChannelViewMode] = useState<'channels' | 'users'>('channels')

  // Search & Filters for Withdrawals
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [withdrawalSearch, setWithdrawalSearch] = useState('')

  // Search for Trades
  const [tradeSearch, setTradeSearch] = useState('')

  // Settings form states
  const [coinPriceUsdInput, setCoinPriceUsdInput] = useState<string>(String(settings?.coinPriceUsd || 0.01))
  const [usdToUzsRateInput, setUsdToUzsRateInput] = useState<string>(String(settings?.usdToUzsRate || 13000))
  const [streamRate360pInput, setStreamRate360pInput] = useState<string>(String(settings?.streamRate360p ?? 1))
  const [streamRate720pInput, setStreamRate720pInput] = useState<string>(String(settings?.streamRate720p ?? 3))
  const [streamRate1080pInput, setStreamRate1080pInput] = useState<string>(String(settings?.streamRate1080p ?? 7))
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Action Modals State
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  // Sync settings when fetched
  useEffect(() => {
    if (settings) {
      setCoinPriceUsdInput(String(settings.coinPriceUsd || 0.01))
      setUsdToUzsRateInput(String(settings.usdToUzsRate || 13000))
      setStreamRate360pInput(String(settings.streamRate360p ?? 1))
      setStreamRate720pInput(String(settings.streamRate720p ?? 3))
      setStreamRate1080pInput(String(settings.streamRate1080p ?? 7))
    }
  }, [settings])

  const fetchData = async (quiet = false) => {
    try {
      if (!quiet) {
        setIsLoading(true)
      }
      const [statsData, withdrawalsData, tradesData, channelsData, usersData] = await Promise.all([
        getAdminStats(),
        getWithdrawals(),
        getRecentTrades(),
        getAdminChannels(),
        getAdminUsers(),
      ])
      setStats(statsData)
      setWithdrawals(Array.isArray(withdrawalsData) ? withdrawalsData : [])
      setTrades(Array.isArray(tradesData) ? tradesData : [])
      setChannels(Array.isArray(channelsData) ? channelsData : [])
      setUsersList(Array.isArray(usersData) ? usersData : [])
    } catch (error: any) {
      console.error('Error fetching admin data:', error)
      showToast(error?.message || "Ma'lumotlarni yuklashda xatolik yuz berdi", 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData()
    }
  }, [user])

  // Handle Approve
  const handleApprove = async () => {
    if (!confirmApproveId) return
    try {
      setIsApproving(true)
      await approveWithdrawal(confirmApproveId)
      showToast("So'rov muvaffaqiyatli tasdiqlandi!", 'success')
      setConfirmApproveId(null)
      await fetchData(true)
    } catch (error: any) {
      showToast(error?.message || "Tasdiqlashda xatolik yuz berdi", 'error')
    } finally {
      setIsApproving(false)
    }
  }

  // Handle Reject
  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return
    try {
      setIsRejecting(true)
      await rejectWithdrawal(rejectId, rejectReason.trim())
      showToast("So'rov bekor qilindi va mablag' kanal balansiga qaytarildi", 'info')
      setRejectId(null)
      setRejectReason('')
      await fetchData(true)
    } catch (error: any) {
      showToast(error?.message || "Bekor qilishda xatolik yuz berdi", 'error')
    } finally {
      setIsRejecting(false)
    }
  }

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    try {
      await updateSettings({
        coinPriceUsd: parseFloat(coinPriceUsdInput),
        usdToUzsRate: parseFloat(usdToUzsRateInput),
        streamRate360p: parseFloat(streamRate360pInput),
        streamRate720p: parseFloat(streamRate720pInput),
        streamRate1080p: parseFloat(streamRate1080pInput),
      })
      showToast("Tizim sozlamalari muvaffaqiyatli saqlandi!", 'success')
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Sozlamalarni saqlashda xatolik", 'error')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    return (withdrawals || []).filter((item) => {
      const matchesFilter =
        withdrawalFilter === 'all' ? true : item.status === withdrawalFilter

      const searchLower = withdrawalSearch.toLowerCase().trim()
      const matchesSearch =
        !searchLower ||
        (item.authorName || '').toLowerCase().includes(searchLower) ||
        (item.channelName || '').toLowerCase().includes(searchLower) ||
        (item.cardNumber || '').toLowerCase().includes(searchLower) ||
        (item.authorPhone || '').toLowerCase().includes(searchLower)

      return matchesFilter && matchesSearch
    })
  }, [withdrawals, withdrawalFilter, withdrawalSearch])

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return (trades || []).filter((item) => {
      const searchLower = tradeSearch.toLowerCase().trim()
      if (!searchLower) return true
      return (
        (item.buyerName || '').toLowerCase().includes(searchLower) ||
        (item.courseName || '').toLowerCase().includes(searchLower)
      )
    })
  }, [trades, tradeSearch])

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return (channels || []).filter((ch) => {
      const searchLower = channelSearch.toLowerCase().trim()
      if (!searchLower) return true
      return (
        ch.title.toLowerCase().includes(searchLower) ||
        ch.username.toLowerCase().includes(searchLower) ||
        (ch.owner?.fullName || '').toLowerCase().includes(searchLower) ||
        (ch.owner?.phone || '').includes(searchLower)
      )
    })
  }, [channels, channelSearch])

  // Filtered users
  const filteredUsers = useMemo(() => {
    return (usersList || []).filter((u) => {
      const searchLower = channelSearch.toLowerCase().trim()
      if (!searchLower) return true
      return (
        u.fullName.toLowerCase().includes(searchLower) ||
        u.phone.includes(searchLower)
      )
    })
  }, [usersList, channelSearch])

  // Pending withdrawals
  const pendingWithdrawalsList = useMemo(() => {
    return (withdrawals || []).filter((w) => w.status === 'pending')
  }, [withdrawals])

  // Calculated rate preview
  const calculatedCoinInUzs = Math.round(
    (parseFloat(coinPriceUsdInput) || 0) * (parseFloat(usdToUzsRateInput) || 0)
  )

  const pendingCount = (stats?.pendingWithdrawals ?? (stats as any)?.pendingWithdrawalsCount) || 0

  // Guard for non-admin
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50 dark:bg-zinc-950">
        <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Ruxsat cheklangan
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md mb-6">
          Ushbu sahifaga faqat platforma ma'murlari (Admin) ruxsat olgan.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
        <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400 animate-pulse">
          Admin paneli yuklanmoqda...
        </p>
      </div>
    )
  }

  const selectedApproveItem = (withdrawals || []).find((w) => w.id === confirmApproveId)

  return (
    <div className="h-screen h-[100dvh] bg-gray-50/50 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden">
      {/* Dedicated Admin Navbar */}
      <AdminNavbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onNavigateHome={() => onNavigate('home')}
      />

      {/* Main Admin Workspace: Sidebar + Content */}
      <div className="flex-1 flex w-full min-h-0 overflow-hidden">
        {/* Dedicated Admin Sidebar */}
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onNavigateHome={() => onNavigate('home')}
          pendingCount={pendingCount}
          tradesCount={trades.length}
          channelsCount={channels.length || stats?.totalChannels || 0}
        />

        {/* Dynamic Admin Content */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20 lg:pb-8">
          {/* TAB 1: OVERVIEW (Umumiy Dashboard) */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Metrics Grid: A'zolar va Kanallar alohida */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Metric 1: Jami Aylanma */}
                <div
                  onClick={() => setActiveTab('trades')}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                      Jami Aylanma
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {(stats?.totalRevenue || 0).toLocaleString()}{' '}
                    <span className="text-sm font-bold text-gray-400">soʻm</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
                    <span>Barcha savdolar</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Batafsil <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Metric 2: Platforma Sof Foydasi */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                      Platforma Daromadi
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {((stats?.netProfit ?? (stats as any)?.platformIncome) || 0).toLocaleString()}{' '}
                    <span className="text-sm font-bold text-indigo-400/80">soʻm</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
                    <span>Platforma ulushi</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">Sof foyda</span>
                  </div>
                </div>

                {/* Metric 3: A'zolar (Foydalanuvchilar) - ALOHIDA */}
                <div
                  onClick={() => {
                    setActiveTab('channels')
                    setChannelViewMode('users')
                  }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group hover:border-violet-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                      A'zolar (Userlar)
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {(stats?.totalUsers || 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">ta</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
                    <span>Ro‘yxatdan o‘tgan</span>
                    <span className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Ro‘yxat <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Metric 4: Ochilgan Kanallar - ALOHIDA */}
                <div
                  onClick={() => {
                    setActiveTab('channels')
                    setChannelViewMode('channels')
                  }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group hover:border-blue-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                      Ochilgan Kanallar
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Tv2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                    {(stats?.totalChannels || channels.length || 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">ta</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
                    <span>Muallif kanallari</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Ko‘rish <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Metric 5: Kutilayotgan Yechishlar */}
                <div
                  onClick={() => setActiveTab('withdrawals')}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group hover:border-amber-500/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                      Kutilayotgan Yechishlar
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span>{pendingCount}</span>
                    {pendingCount > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white animate-pulse">
                        Kutilmoqda
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-400">
                    <span>Mualliflar arizalari</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Arizalar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Overview Two-Column Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Pending Withdrawals Box */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Kutilayotgan To'lov Arizalari
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('withdrawals')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Barchasini ko'rish <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {pendingWithdrawalsList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
                      Kutilayotgan hech qanday so'rov yo'q. Barcha to'lovlar ko'rib chiqilgan!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingWithdrawalsList.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800"
                        >
                          <div>
                            <div className="font-bold text-xs text-gray-900 dark:text-white">
                              {item.authorName} ({item.channelName})
                            </div>
                            <div className="font-mono text-[11px] text-gray-400 mt-0.5">
                              {item.cardNumber}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-xs text-indigo-600 dark:text-indigo-400">
                              {item.amount.toLocaleString()} soʻm
                            </span>
                            <button
                              onClick={() => setConfirmApproveId(item.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
                            >
                              Tasdiqlash
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Recent Trades Preview */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        So'nggi Savdolar Jurnali
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('trades')}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Barchasini ko'rish <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {trades.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
                      Hozircha platformada xaridlar amalga oshirilmagan.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trades.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800"
                        >
                          <div className="min-w-0 pr-3">
                            <div className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {item.courseName}
                            </div>
                            <div className="text-[11px] text-gray-400">
                              Xaridor: {item.buyerName}
                            </div>
                          </div>
                          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 shrink-0">
                            {item.price.toLocaleString()} soʻm
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KANALLAR & FOYDALANUVCHILAR */}
          {activeTab === 'channels' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Title & Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Kanallar & Foydalanuvchilar
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                    Kanal ustiga bosib yuklangan videolar, ko‘rishlar va balans haqida batafsil maʼlumot oling
                  </p>
                </div>

                {/* Switch between Channels and Users */}
                <div className="flex items-center p-1 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setChannelViewMode('channels')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      channelViewMode === 'channels'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Tv2 className="w-3.5 h-3.5" />
                    <span>Ochilgan Kanallar ({channels.length})</span>
                  </button>
                  <button
                    onClick={() => setChannelViewMode('users')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      channelViewMode === 'users'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Barcha A'zolar ({usersList.length})</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    channelViewMode === 'channels'
                      ? 'Kanal nomi, @username yoki muallif bo‘yicha...'
                      : 'Foydalanuvchi ismi yoki telefon raqami...'
                  }
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white shadow-xs"
                />
              </div>

              {/* CHANNELS VIEW */}
              {channelViewMode === 'channels' && (
                <>
                  {filteredChannels.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
                      <Tv2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        Kanallar topilmadi
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        Qidiruv bo‘yicha hech qanday kanal mavjud emas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredChannels.map((ch) => (
                        <div
                          key={ch.id}
                          onClick={() => setSelectedChannel(ch)}
                          className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                        >
                          {/* Channel Header */}
                          <div className="flex items-start gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 overflow-hidden shrink-0 flex items-center justify-center font-black text-lg border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-105 transition-transform">
                              {ch.avatar ? (
                                <img
                                  src={ch.avatar}
                                  alt={ch.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{ch.title.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                                  {ch.title}
                                </h3>
                              </div>
                              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate mt-0.5">
                                @{ch.username}
                              </div>
                              <div className="text-[11px] text-gray-400 dark:text-zinc-400 flex items-center gap-1 mt-1 truncate">
                                <UserIcon className="w-3 h-3 shrink-0" />
                                <span className="truncate">Egasi: {ch.owner?.fullName || 'Noma\'lum'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stats Badges Grid */}
                          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800/80 text-xs">
                            <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50 flex items-center gap-2">
                              <Film className="w-4 h-4 text-indigo-500 shrink-0" />
                              <div className="truncate">
                                <div className="text-[10px] text-gray-400">Videolar</div>
                                <div className="font-black text-gray-900 dark:text-white">
                                  {ch.videosCount} ta
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50 flex items-center gap-2">
                              <Eye className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div className="truncate">
                                <div className="text-[10px] text-gray-400">Ko‘rishlar</div>
                                <div className="font-black text-gray-900 dark:text-white">
                                  {ch.totalViews.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50 flex items-center gap-2">
                              <Users className="w-4 h-4 text-violet-500 shrink-0" />
                              <div className="truncate">
                                <div className="text-[10px] text-gray-400">Obunachilar</div>
                                <div className="font-black text-gray-900 dark:text-white">
                                  {ch.subscribersCount.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-zinc-800/50 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-amber-500 shrink-0" />
                              <div className="truncate">
                                <div className="text-[10px] text-gray-400">Balans</div>
                                <div className="font-black text-emerald-600 dark:text-emerald-400 truncate">
                                  {ch.balance.toLocaleString()} so‘m
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer Call-to-action */}
                          <div className="flex items-center justify-between text-xs pt-1 text-gray-400">
                            <span className="text-[11px]">
                              {new Date(ch.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              Batafsil maʼlumot <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* USERS VIEW */}
              {channelViewMode === 'users' && (
                <div className="overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 dark:bg-zinc-800/50 border-b border-gray-200/80 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                          <th className="py-3 px-4">Foydalanuvchi</th>
                          <th className="py-3 px-4">Telefon</th>
                          <th className="py-3 px-4">Roli</th>
                          <th className="py-3 px-4 text-center">Coins Balansi</th>
                          <th className="py-3 px-4 text-right">Ro‘yxatdan o‘tgan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                              Foydalanuvchilar topilmadi
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr
                              key={u.id}
                              className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                            >
                              <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[10px] font-black">
                                  {u.fullName.charAt(0).toUpperCase()}
                                </div>
                                <span>{u.fullName}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-gray-600 dark:text-zinc-400">
                                {u.phone}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    u.role === 'admin'
                                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
                                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'
                                  }`}
                                >
                                  {u.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-black text-amber-600 dark:text-amber-400">
                                {u.coins.toLocaleString()} coin
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-gray-400">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WITHDRAWALS (Pul yechib olish so'rovlari) */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Pul Yechib Olish So‘rovlari
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  Mualliflar tomonidan yuborilgan bank kartalariga pul o'tkazish arizalari
                </p>
              </div>

              {/* Subfilters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(
                    [
                      { id: 'all', label: 'Barchasi' },
                      { id: 'pending', label: 'Kutilayotgan' },
                      { id: 'approved', label: 'Tasdiqlangan' },
                      { id: 'rejected', label: 'Rad etilgan' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setWithdrawalFilter(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        withdrawalFilter === tab.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200/80 dark:border-zinc-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Muallif, kanal yoki karta..."
                    value={withdrawalSearch}
                    onChange={(e) => setWithdrawalSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* List */}
              {filteredWithdrawals.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
                  <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Arizalar topilmadi
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Tanlangan filtr yoki qidiruv so'rovi bo'yicha pul yechish so'rovi mavjud emas.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {filteredWithdrawals.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-gray-300 dark:hover:border-zinc-700 transition-all"
                    >
                      {/* Left: Author Info */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden shrink-0 flex items-center justify-center text-base border border-indigo-100 dark:border-indigo-900/40">
                          {req.authorAvatar ? (
                            <img
                              src={req.authorAvatar}
                              alt={req.authorName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{(req.authorName || 'M').charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
                              {req.authorName}
                            </h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                              @{req.channelName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400 mt-1 flex-wrap">
                            <span>{req.authorPhone}</span>
                            <span>•</span>
                            <span>{new Date(req.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Card Details */}
                      <div className="bg-gray-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-zinc-800/80 self-start lg:self-center">
                        <div className="text-[10px] font-bold uppercase text-gray-400 dark:text-zinc-400 tracking-wider">
                          Qabul qiluvchi karta
                        </div>
                        <div className="font-mono text-sm font-bold text-gray-800 dark:text-zinc-200 tracking-wider mt-0.5 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-500" />
                          <span>{req.cardNumber}</span>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-zinc-800">
                        <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                          {req.amount.toLocaleString()}{' '}
                          <span className="text-xs font-bold text-gray-400">soʻm</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => setConfirmApproveId(req.id)}
                                className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Tasdiqlash</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectId(req.id)
                                  setRejectReason('')
                                }}
                                className="flex items-center gap-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Rad etish</span>
                              </button>
                            </>
                          ) : req.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Tasdiqlangan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                              <XCircle className="w-3.5 h-3.5" />
                              Rad etilgan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRADES (Savdolar Auditi) */}
          {activeTab === 'trades' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Savdolar Auditi
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  Platformada sotilgan barcha darsliklar va kurslar to'lov tarixi
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Jami savdolar soni: <strong className="text-indigo-600 dark:text-indigo-400">{filteredTrades.length}</strong>
                </p>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Xaridor yoki kurs nomi..."
                    value={tradeSearch}
                    onChange={(e) => setTradeSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-zinc-800/50 border-b border-gray-200/80 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-400">
                        <th className="py-3 px-4">Sana & Vaqt</th>
                        <th className="py-3 px-4">Xaridor</th>
                        <th className="py-3 px-4">Darslik / Kurs Nomi</th>
                        <th className="py-3 px-4 text-right">Summa (UZS)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60 text-xs">
                      {filteredTrades.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-zinc-500">
                            Savdolar topilmadi
                          </td>
                        </tr>
                      ) : (
                        filteredTrades.map((trade) => (
                          <tr
                            key={trade.id}
                            className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono text-gray-500 dark:text-zinc-400">
                              {new Date(trade.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-black">
                                {(trade.buyerName || 'X').charAt(0).toUpperCase()}
                              </div>
                              <span>{trade.buyerName}</span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-zinc-300 max-w-xs truncate">
                              {trade.courseName}
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                              {trade.price.toLocaleString()} soʻm
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS (Coin & Striming narxlari) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  Coin & Video Striming Tariflari
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  1 Coin kursi, AQSH dollari konvertatsiyasi va video ijrosi uchun daqiqalik stavkalar
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-xs">
                  <div className="flex items-center gap-3 pb-6 mb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Tizim Valyutasi Parametrlari
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        O'zgarishlar barcha keyingi hisob-kitoblar uchun zudlik bilan qo'llaniladi
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          1 Coin Narxi (AQSH dollarida)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.001"
                            min="0.0001"
                            value={coinPriceUsdInput}
                            onChange={(e) => setCoinPriceUsdInput(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        <p className="text-[11px] text-gray-400">Standart: 0.01 (1 coin = $0.01)</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                          1 AQSH Dollari Kursi (Oʻzbek soʻmida)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="10"
                            min="1"
                            value={usdToUzsRateInput}
                            onChange={(e) => setUsdToUzsRateInput(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            required
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                            UZS
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">Standart: 13 000 soʻm</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                        <Tv className="w-4 h-4 text-indigo-500" />
                        Video ijrosi boʻyicha daqiqalik tariflar
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">
                        Video tomosha qilinganda uning sifatiga qarab foydalanuvchi balansidan yechiladigan tangalar
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">360p</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                              SD
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={streamRate360pInput}
                              onChange={(e) => setStreamRate360pInput(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                              required
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              coin/daq
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">720p</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                              HD
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={streamRate720pInput}
                              onChange={(e) => setStreamRate720pInput(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                              required
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              coin/daq
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/80 dark:border-zinc-700 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">1080p</span>
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                              FHD
                            </span>
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={streamRate1080pInput}
                              onChange={(e) => setStreamRate1080pInput(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                              required
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              coin/daq
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saqlanmoqda...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Sozlamalarni Saqlash</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 rounded-3xl border border-amber-200/60 dark:border-amber-800/40 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                      <Coins className="w-4 h-4" />
                      <span>Jonli Hisoblagich</span>
                    </div>

                    <div>
                      <div className="text-xs text-amber-900/70 dark:text-amber-300/70">
                        Hisoblangan 1 Coin narxi:
                      </div>
                      <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
                        {calculatedCoinInUzs.toLocaleString()} <span className="text-sm font-bold">soʻm</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-200/40 dark:border-amber-800/30 text-xs space-y-2 text-gray-600 dark:text-zinc-300">
                      <div className="font-bold text-gray-900 dark:text-white">
                        💡 Namunaviy darslik narxi:
                      </div>
                      <p>
                        Agar muallif darslikka <strong>100 000 soʻm</strong> belgilasa, foydalanuvchi hisobidan taxminan{' '}
                        <strong className="text-indigo-600 dark:text-indigo-400">
                          {Math.ceil(100000 / Math.max(1, calculatedCoinInUzs)).toLocaleString()} coin
                        </strong>{' '}
                        yechib olinadi.
                      </p>
                    </div>

                    <div className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      📌 Kurs o'zgarganda tizim avtomatik barcha keyingi to'lovlarda yangi stavkadan foydalanadi.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CHANNEL DETAIL MODAL (Kanal ustiga bosganda ochiladigan to'liq tafsilotlar) */}
      {selectedChannel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedChannel(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Title and Close button */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  Kanal Tafsilotlari
                </span>
                <span className="text-xs text-gray-400">ID: {selectedChannel.id}</span>
              </div>
              <button
                onClick={() => setSelectedChannel(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Channel Branding & Info */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 overflow-hidden shrink-0 flex items-center justify-center font-black text-2xl border border-indigo-100 dark:border-indigo-900/40">
                {selectedChannel.avatar ? (
                  <img
                    src={selectedChannel.avatar}
                    alt={selectedChannel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{selectedChannel.title.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                  {selectedChannel.title}
                </h3>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  @{selectedChannel.username}
                </p>
                {selectedChannel.description && (
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {selectedChannel.description}
                  </p>
                )}
              </div>
            </div>

            {/* Channel Owner Card */}
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800/80 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Kanal Egasi (Muallif)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-400">Muallif ismi</div>
                    <div className="font-bold text-gray-900 dark:text-white truncate">
                      {selectedChannel.owner?.fullName || 'Noma\'lum'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-400">Telefon raqami</div>
                    <div className="font-mono font-bold text-gray-900 dark:text-white">
                      {selectedChannel.owner?.phone || 'Mavjud emas'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-400">Shaxsiy Coins</div>
                    <div className="font-black text-amber-600 dark:text-amber-400">
                      {(selectedChannel.owner?.coins || 0).toLocaleString()} coin
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics 4-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-center">
                <div className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-400">
                  Kanal Balansi
                </div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {selectedChannel.balance.toLocaleString()} soʻm
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40 text-center">
                <div className="text-[10px] font-bold uppercase text-indigo-800 dark:text-indigo-400">
                  Videolar
                </div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {selectedChannel.videosCount} ta
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 text-center">
                <div className="text-[10px] font-bold uppercase text-blue-800 dark:text-blue-400">
                  Jami Ko‘rishlar
                </div>
                <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-1">
                  {selectedChannel.totalViews.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/40 text-center">
                <div className="text-[10px] font-bold uppercase text-violet-800 dark:text-violet-400">
                  Obunachilar
                </div>
                <div className="text-base font-black text-violet-600 dark:text-violet-400 mt-1">
                  {selectedChannel.subscribersCount.toLocaleString()} ta
                </div>
              </div>
            </div>

            {/* Playlists / Courses List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Kanalga Yuklangan Kurslar ({selectedChannel.playlists?.length || 0})
                </span>
              </div>

              {!selectedChannel.playlists || selectedChannel.playlists.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
                  Ushbu kanalda hozircha kurslar yaratilmagan.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {selectedChannel.playlists.map((pl) => (
                    <div
                      key={pl.id}
                      className="p-3 rounded-xl bg-gray-50/80 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-zinc-700 shrink-0">
                          {pl.thumbnail ? (
                            <img src={pl.thumbnail} alt={pl.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                              Kurs
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 dark:text-white truncate">{pl.title}</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span>{pl.videosCount} ta video</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" /> {pl.rating}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-emerald-600 dark:text-emerald-400">
                          {pl.rawPrice > 0 ? `${pl.rawPrice.toLocaleString()} soʻm` : 'Bepul'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => setSelectedChannel(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 transition cursor-pointer"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmApproveId && selectedApproveItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setConfirmApproveId(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                To'lovni tasdiqlaysizmi?
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Ushbu so'rov tasdiqlangach, muallifga pul o'tkazilgan deb hisoblanadi.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Muallif:</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedApproveItem.authorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Summa:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {selectedApproveItem.amount.toLocaleString()} soʻm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Karta raqami:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {selectedApproveItem.cardNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setConfirmApproveId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Tasdiqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tasdiqlash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            setRejectId(null)
            setRejectReason('')
          }}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full p-6 border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                So'rovni rad etish
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                Rad etilganda mablag' avtomatik tarzda muallifning kanal balansiga qaytariladi.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-gray-400">Tezkor sabablar:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Karta raqami noto'g'ri",
                  "Balans nomuvofiq",
                  "Xavfsizlik qoidasi buzildi",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRejectReason(tag)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 transition cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-2xl p-3 text-xs outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 dark:text-white min-h-[90px]"
              placeholder="Rad etish sababini batafsil yozing..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setRejectId(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rad etilmoqda...</span>
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Rad etish va pulni qaytarish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
