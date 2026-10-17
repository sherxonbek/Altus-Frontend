import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  History as HistoryIcon,
  Trash2,
  Sparkles,
  Search,
  PauseCircle,
  PlayCircle,
  Play,
  Bookmark,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Flame,
  LayoutGrid,
  List,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Film,
  Coins,
} from 'lucide-react'
import { playlistApi } from '../api/playlist.api'
import type { CoursePlaylist, HistoryItem } from '../types'
import { CourseDetail } from '../components/video'
import { useHistoryStore } from '../store/useSavedStore'
import { useSavedStore } from '../store/useSavedStore'
import { useToastStore } from '../store/useToastStore'
import type { PageType } from '../components/layout'

interface HistoryPageProps {
  onNavigate?: (page: PageType) => void
}

type FilterTab = 'all' | 'today' | 'yesterday' | 'week' | 'completed'
type ViewMode = 'list' | 'grid'

export const HistoryPage = ({ onNavigate }: HistoryPageProps) => {
  const {
    history,
    isHistoryPaused,
    removeFromHistory,
    clearHistory,
    togglePauseHistory,
    seedHistoryIfEmpty,
  } = useHistoryStore()

  const { isPlaylistSaved, toggleSavePlaylist } = useSavedStore()
  const showToast = useToastStore((state) => state.showToast)

  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedCourse, setSelectedCourse] = useState<CoursePlaylist | null>(null)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)

  // Seed sample history if empty using playlists
  useEffect(() => {
    let isMounted = true
    if (history.length === 0) {
      setIsLoading(true)
      playlistApi
        .getAllPlaylists()
        .then((playlists) => {
          if (isMounted && playlists && playlists.length > 0) {
            seedHistoryIfEmpty(playlists)
          }
        })
        .catch((err) => {
          console.error('Failed to load playlists for history:', err)
        })
        .finally(() => {
          if (isMounted) setIsLoading(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [history.length, seedHistoryIfEmpty])

  // Relative time helper
  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMinutes < 1) return 'Hozirgina'
      if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`
      if (diffHours < 24) return `${diffHours} soat oldin`
      if (diffDays === 1) return 'Kecha'
      if (diffDays < 7) return `${diffDays} kun oldin`
      return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })
    } catch {
      return 'Yaqinda'
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCount = history.length
    if (totalCount === 0) {
      return { totalCount: 0, totalHours: '0.0', avgProgress: 0, completedCount: 0 }
    }

    const completed = history.filter((h) => h.progress >= 90).length
    const totalProgress = history.reduce((acc, curr) => acc + (curr.progress || 0), 0)
    const avgProgress = Math.round(totalProgress / totalCount)

    // Estimation: 25 minutes average per watched item proportional to progress
    const totalMinutes = history.reduce((acc, curr) => {
      return acc + (25 * (curr.progress || 20)) / 100
    }, 0)
    const totalHours = (totalMinutes / 60).toFixed(1)

    return {
      totalCount,
      totalHours,
      avgProgress,
      completedCount: completed,
    }
  }, [history])

  // Filter & Search
  const filteredHistory = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
    const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000

    return history.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchesTitle = item.title?.toLowerCase().includes(query)
        const matchesChannel = item.channelTitle?.toLowerCase().includes(query)
        const matchesCategory = item.category?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesChannel && !matchesCategory) return false
      }

      // 2. Filter Tab
      const itemTime = new Date(item.watchedAt).getTime()
      if (activeFilter === 'today') {
        return itemTime >= startOfToday
      }
      if (activeFilter === 'yesterday') {
        return itemTime >= startOfYesterday && itemTime < startOfToday
      }
      if (activeFilter === 'week') {
        return itemTime >= startOfWeek
      }
      if (activeFilter === 'completed') {
        return item.progress >= 90
      }

      return true
    })
  }, [history, searchQuery, activeFilter])

  // Group by Date sections
  const groupedSections = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
    const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000

    const groups: {
      title: string
      badge: string
      items: HistoryItem[]
    }[] = [
      { title: 'Bugun tomosha qilinganlar', badge: 'Bugun', items: [] },
      { title: 'Kecha tomosha qilinganlar', badge: 'Kecha', items: [] },
      { title: 'Ushbu hafta', badge: 'Oxirgi 7 kun', items: [] },
      { title: 'Avvalroq ko‘rilganlar', badge: 'Eski videolar', items: [] },
    ]

    filteredHistory.forEach((item) => {
      const itemTime = new Date(item.watchedAt).getTime()
      if (itemTime >= startOfToday) {
        groups[0].items.push(item)
      } else if (itemTime >= startOfYesterday) {
        groups[1].items.push(item)
      } else if (itemTime >= startOfWeek) {
        groups[2].items.push(item)
      } else {
        groups[3].items.push(item)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [filteredHistory])

  // Handlers
  const handleOpenCourse = useCallback((item: HistoryItem) => {
    if (item.rawPlaylist) {
      setSelectedCourse(item.rawPlaylist)
      return
    }
    // Fetch playlist if rawPlaylist is not attached
    playlistApi
      .getPlaylist(String(item.playlistId))
      .then((course) => {
        if (course) setSelectedCourse(course)
      })
      .catch((err) => {
        console.error('Failed to load course details:', err)
      })
  }, [])

  const handleToggleSaveItem = (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation()
    if (item.rawPlaylist) {
      const res = toggleSavePlaylist(item.rawPlaylist)
      showToast(res.message, res.isSaved ? 'success' : 'info')
    } else {
      playlistApi.getPlaylist(String(item.playlistId)).then((p) => {
        if (p) {
          const res = toggleSavePlaylist(p)
          showToast(res.message, res.isSaved ? 'success' : 'info')
        }
      })
    }
  }

  const handleRemoveSingle = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation()
    removeFromHistory(id)
    showToast("Video tarixdan o'chirildi", 'info')
  }

  const handleConfirmClearAll = () => {
    clearHistory()
    setShowClearConfirmModal(false)
    showToast('Ko‘rishlar tarixi butunlay tozalandi', 'success')
  }

  // Render Course Detail if clicked
  if (selectedCourse) {
    return (
      <CourseDetail
        courseId={selectedCourse.id}
        customCourse={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-zinc-950 p-6 sm:p-8 text-white border border-indigo-800/40 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Shaxsiy kundalik
              </span>
              {isHistoryPaused && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <PauseCircle className="w-3 h-3 text-amber-400" />
                  Yozib olish to‘xtatilgan
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <HistoryIcon className="w-8 h-8 text-indigo-400" />
              Ko‘rishlar tarixi
            </h1>
            <p className="text-sm text-indigo-200/80 max-w-xl">
              Siz tomosha qilgan darsliklar, kurslar va videolarni qulay vaqtda qayta davom ettiring
            </p>
          </div>

          {/* Quick Header Metric Badges */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-xl sm:text-2xl font-black text-indigo-300">
                {stats.totalCount}
              </div>
              <div className="text-[11px] font-medium text-indigo-200/70 uppercase tracking-wider">
                Videolar
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {stats.totalHours} <span className="text-xs font-medium">soat</span>
              </div>
              <div className="text-[11px] font-medium text-indigo-200/70 uppercase tracking-wider">
                Vaqt
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center min-w-[90px]">
              <div className="text-xl sm:text-2xl font-black text-amber-300">
                {stats.avgProgress}%
              </div>
              <div className="text-[11px] font-medium text-indigo-200/70 uppercase tracking-wider">
                Progress
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Asosiy Ikki Ustunli Maket (Asosiy Video Ro'yxat + Sticky Control Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CHAP / ASOSIY QISM (8 ustun) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filtrlash va View Switcher Paneli */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/80 p-3 sm:p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-md">
            {/* Filtr tugmalari */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'today', label: 'Bugun' },
                { id: 'yesterday', label: 'Kecha' },
                { id: 'week', label: 'Bu hafta' },
                { id: 'completed', label: 'Tugallangan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as FilterTab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Switcher: List vs Grid */}
            <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-zinc-800">
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                {filteredHistory.length} ta natija
              </span>
              <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('list')}
                  title="Qatorli ko‘rinish"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Kartali (Grid) ko‘rinish"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loader Holati */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800"
                >
                  <div className="w-full sm:w-56 aspect-video bg-gray-200 dark:bg-zinc-800 rounded-xl" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
                    <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BO'SH HOLAT (Empty State) */}
          {!isLoading && filteredHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-zinc-900/60 rounded-3xl border border-gray-200/70 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Film className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-500 text-white shadow-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {searchQuery ? "Mos keluvchi video topilmadi" : "Hozircha ko'rishlar tarixi bo'sh"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                  {searchQuery
                    ? `"${searchQuery}" so‘rovi bo‘yicha hech narsa chiqmadi. Boshqa so‘z bilan izlab ko‘ring.`
                    : "Siz hali birorta ham darslik yoki video tomosha qilmadingiz. Yangi bilimlarni kashf etish vaqti keldi!"}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-sm font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                  >
                    Qidiruvni tozalash
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate?.('home')}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition duration-200 cursor-pointer"
                  >
                    <span>Bosh sahifaga o‘tish</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* GURUHLANGAN VIDEOLAR RO'YXATI */}
          {!isLoading && filteredHistory.length > 0 && (
            <div className="space-y-8">
              {groupedSections.map((section) => (
                <div key={section.title} className="space-y-4">
                  {/* Guruh Sarlavhasi */}
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                      {section.items.length} ta
                    </span>
                  </div>

                  {/* Ko'rinish formati: List yoki Grid */}
                  {viewMode === 'list' ? (
                    <div className="flex flex-col gap-3.5">
                      {section.items.map((item) => {
                        const isSaved = isPlaylistSaved(item.playlistId)
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenCourse(item)}
                            className="group relative flex flex-col sm:flex-row items-start gap-4 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 hover:border-indigo-500/60 hover:shadow-xl transition-all duration-300 cursor-pointer"
                          >
                            {/* Chap tomon: Thumbnail + Davomiylik + Progress chizig'i */}
                            <div className="relative w-full sm:w-60 md:w-64 aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />

                              {/* Play Hover Overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>

                              {/* Davomiylik badge */}
                              {item.duration && (
                                <div className="absolute bottom-2.5 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white tracking-wide">
                                  {item.duration}
                                </div>
                              )}

                              {/* Progress bar pastda */}
                              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-700/60 overflow-hidden">
                                <div
                                  className="h-full bg-red-600 transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>

                            {/* O'ng tomon: Ma'lumotlar va Tugmalar */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch gap-2">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {item.title}
                                  </h3>

                                  {/* Quick Actions (Desktop & Mobile) */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => handleToggleSaveItem(e, item)}
                                      title={isSaved ? "Saqlanganlardan o'chirish" : "Saqlab qo'yish"}
                                      className={`p-2 rounded-xl transition cursor-pointer ${
                                        isSaved
                                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-700 dark:hover:text-zinc-200'
                                      }`}
                                    >
                                      <Bookmark
                                        className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`}
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleRemoveSingle(e, item.id)}
                                      title="Tarixdan o'chirish"
                                      className="p-2 rounded-xl text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Muallif va kategoriya */}
                                <div className="flex items-center gap-2 mt-2">
                                  {item.channelAvatar ? (
                                    <img
                                      src={item.channelAvatar}
                                      alt={item.channelTitle}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                                      {item.channelTitle?.[0] || 'A'}
                                    </div>
                                  )}
                                  <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300 truncate">
                                    {item.channelTitle}
                                  </span>
                                  {item.channelVerified && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500/20" />
                                  )}
                                  {item.category && (
                                    <>
                                      <span className="text-gray-300 dark:text-zinc-700">•</span>
                                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 font-medium truncate">
                                        {item.category}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Pastki Meta: Oxirgi ko'rilgan vaqt, foiz va davom ettirish */}
                              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800/80 text-xs">
                                <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400">
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatRelativeTime(item.watchedAt)}
                                  </span>
                                  <span>•</span>
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {item.progress}% ko‘rilgan
                                  </span>
                                  {item.coins !== undefined && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                                        <Coins className="w-3.5 h-3.5" />
                                        {item.coins} coin
                                      </span>
                                    </>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleOpenCourse(item)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-semibold transition cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Davom ettirish</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    /* GRID KO'RINISHI */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.items.map((item) => {
                        const isSaved = isPlaylistSaved(item.playlistId)
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenCourse(item)}
                            className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200/80 dark:border-zinc-800 hover:border-indigo-500/60 hover:shadow-xl transition-all duration-300 cursor-pointer"
                          >
                            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-11 h-11 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </div>
                              </div>
                              {item.duration && (
                                <div className="absolute bottom-2.5 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white">
                                  {item.duration}
                                </div>
                              )}
                              {/* Progress bar */}
                              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-700/60 overflow-hidden">
                                <div
                                  className="h-full bg-red-600 transition-all duration-300"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                              {/* O'chirish & Saqlash tugmalari */}
                              <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleSaveItem(e, item)}
                                  className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition cursor-pointer"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-indigo-400' : ''}`} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleRemoveSingle(e, item.id)}
                                  className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white hover:bg-red-600 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                              <div>
                                <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-600 dark:text-zinc-400 truncate">
                                    {item.channelTitle}
                                  </span>
                                  {item.channelVerified && (
                                    <CheckCircle2 className="w-3 h-3 text-indigo-500 fill-indigo-500/20" />
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-[11px] text-gray-500 dark:text-zinc-400">
                                <span>{formatRelativeTime(item.watchedAt)}</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                  {item.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* O'NG TOMON / STICKY CONTROL PANEL (4 ustun) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
          {/* 1. Tarixdan Qidiruv */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-500" />
              Tarixdan qidirish
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Video yoki muallif nomini yozing..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700/80 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Tozalash
                </button>
              )}
            </div>
          </div>

          {/* 2. Boshqaruv Tugmalari (Tozalash, To'xtatish) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Tarix boshqaruvi
            </h3>

            {/* Tarix yozilishini to'xtatish toggle */}
            <button
              type="button"
              onClick={togglePauseHistory}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition cursor-pointer border ${
                isHistoryPaused
                  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300'
                  : 'bg-gray-50 dark:bg-zinc-800/60 border-gray-200/70 dark:border-zinc-700/60 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                {isHistoryPaused ? (
                  <PlayCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                ) : (
                  <PauseCircle className="w-5 h-5 text-gray-500 dark:text-zinc-400 shrink-0" />
                )}
                <div className="text-left">
                  <div className="text-xs font-bold">
                    {isHistoryPaused ? "Tarixni davom ettirish" : "Tarixni to‘xtatib turish"}
                  </div>
                  <div className="text-[11px] opacity-75">
                    {isHistoryPaused ? "Hozir ko‘rishlar yozilmayapti" : "Yangi ko‘rishlar saqlanmoqda"}
                  </div>
                </div>
              </div>
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  isHistoryPaused ? 'bg-amber-500' : 'bg-gray-300 dark:bg-zinc-600'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    isHistoryPaused ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </div>
            </button>

            {/* Barcha tarixni tozalash */}
            <button
              type="button"
              disabled={history.length === 0}
              onClick={() => setShowClearConfirmModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 dark:border-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Barcha ko‘rishlar tarixini tozalash</span>
            </button>
          </div>

          {/* 3. Statistika Kartasi */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 dark:from-zinc-900 dark:to-zinc-900 border border-indigo-100/80 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Ko‘rish statistikasi
              </h3>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                Jonli
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 shadow-xs">
                <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium">
                  Jami videolar
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {stats.totalCount} ta
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 shadow-xs">
                <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium">
                  Tugallangan darslar
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completedCount} ta
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 shadow-xs">
                <span className="text-xs text-gray-600 dark:text-zinc-400 font-medium">
                  Umumiy ko‘rish vaqti
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  ~{stats.totalHours} soat
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-zinc-400 font-medium">
                    O‘rtacha o‘zlashtirish
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {stats.avgProgress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${stats.avgProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tarixni tozalash Tasdiqlash Modali */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ko‘rishlar tarixini tozalaysizmi?
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Bu amal barcha saqlangan ko‘rishlar tarixi va progresslarni o‘chirib yuboradi. Ushbu amalni ortga qaytarib bo‘lmaydi.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                Ha, butunlay tozalash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
