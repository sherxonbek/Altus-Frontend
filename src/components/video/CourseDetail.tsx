import { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Tag,
  ListVideo,
  Lock,
  CreditCard,
  Sparkles,
  Plus,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  LogIn,
  Edit3,
  Trash2,
  UploadCloud,
  Bookmark,
} from 'lucide-react'
import type { CoursePlaylist, CourseLesson, CourseComment } from '../../types'
import { useAuthStore } from '../../store/useAuthStore'
import { useSubscriptionStore } from '../../store/useSubscriptionStore'
import { useChannelStore } from '../../store/useChannelStore'
import { useUploadStore } from '../../store/useUploadStore'
import { useSavedStore } from '../../store/useSavedStore'
import { useToastStore } from '../../store/useToastStore'
import { VideoPlayer } from './VideoPlayer'
import { playlistApi } from '../../api/playlist.api'

interface CourseDetailProps {
  courseId: string | number
  onBack: () => void
  customCourse?: CoursePlaylist
  isOwner?: boolean
  onEditVideo?: (video: CourseLesson) => void
  onDeleteVideo?: (video: CourseLesson) => void
  onAddVideo?: () => void
  onEditPlaylist?: () => void
}

export const CourseDetail = ({
  courseId,
  onBack,
  customCourse,
  isOwner = false,
  onEditVideo,
  onDeleteVideo,
  onAddVideo,
}: CourseDetailProps) => {
  const [course, setCourse] = useState<CoursePlaylist | undefined>(customCourse)
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(
    customCourse?.videos?.[0] || null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)

  // Sotib olingan / to'langan darslar ro'yxati (bepul darslar avtomatik kiradi)
  const [unlockedLessons, setUnlockedLessons] = useState<Set<string | number>>(() => {
    const initial = new Set<string | number>()
    customCourse?.videos?.forEach((v) => {
      if (v.isFree) initial.add(v.id)
    })
    return initial
  })

  // To'liq kurs sotib olinganmi
  const [isFullCoursePurchased, setIsFullCoursePurchased] = useState(false)
  // To'lov jarayoni holati (yuklanish animatsiyasi)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Like, dislike va obuna holati
  const [likeStatus, setLikeStatus] = useState<'liked' | 'disliked' | null>(null)
  const [likesCount, setLikesCount] = useState(customCourse?.likesCount || 1240)

  const { isSubscribed: checkIsSubscribed, toggleSubscription } = useSubscriptionStore()
  const { isAuthenticated, openAuthModal, user, checkAuth } = useAuthStore()
  const { currentChannel } = useChannelStore()
  const { tasks } = useUploadStore()
  const { toggleSaveLesson, isLessonSaved } = useSavedStore()
  const { showToast } = useToastStore()

  useEffect(() => {
    if (customCourse) {
      setCourse(customCourse)
      return
    }
    if (courseId) {
      playlistApi.getPlaylist(String(courseId)).then((data) => {
        if (data) {
          setCourse(data)
          if (data.videos && data.videos.length > 0) {
            setActiveLesson((current) => current || data.videos[0])
            setUnlockedLessons((prev) => {
              const next = new Set(prev)
              data.videos.forEach((v) => {
                if (v.isFree) next.add(v.id)
              })
              return next
            })
          }
        }
      }).catch((e) => {
        console.error('Failed to load course details:', e)
      })
    }
  }, [courseId, customCourse])

  // To'liq kurs sotib olinganligini foydalanuvchi ma'lumotlaridan aniqlash
  const isPurchased = Boolean(
    isFullCoursePurchased ||
    user?.purchasedCourses?.some((id) => String(id) === String(course?.id || courseId))
  )

  const courseUploads = course
    ? tasks.filter((t) => String(t.targetPlaylistId) === String(course.id))
    : []

  // Foydalanuvchining o'z kanali ekanligini aniqlash (o'z kanaliga o'zi obuna bo'lishni oldini olish):
  const isChannelOwner = Boolean(
    isOwner ||
    (isAuthenticated && currentChannel && course?.channel && (
      (course.channel.id && String(course.channel.id) === String(currentChannel.id)) ||
      (course.channel.name && course.channel.name.toLowerCase() === currentChannel.title.toLowerCase()) ||
      (course.channel.username && currentChannel.username && course.channel.username.toLowerCase() === currentChannel.username.toLowerCase())
    ))
  )

  const isSubscribed =
    !isChannelOwner && isAuthenticated && course?.channel
      ? checkIsSubscribed(course.channel.id || course.channel.name)
      : false

  const handleToggleSubscribe = () => {
    // Agar kanal egasi o'zi bo'lsa, obuna bo'lish mumkin emas
    if (isChannelOwner) return

    // Agar login qilinmagan bo'lsa, login qilishni so'rash
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    if (!course?.channel) return
    toggleSubscription({
      id: course.channel.id || `channel-${course.channel.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: course.channel.name,
      avatar: course.channel.avatar,
      verified: !!course.channel.verified,
      subscribers: course.channel.subscribers || '10K',
      rating: course.channel.rating || 4.8,
      courseCount: 1,
    })
  }

  // Tavsifni to'liq ochish/yopish holati
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  // Har bir video darslik uchun alohida izohlar (Comments) xaritasi
  const [commentsByLesson, setCommentsByLesson] = useState<Record<string | number, CourseComment[]>>(() => {
    const map: Record<string | number, CourseComment[]> = {}
    course?.videos.forEach((v) => {
      map[v.id] = v.comments ? [...v.comments] : []
    })
    return map
  })

  // Yangi yozilayotgan izoh matni va focus holati
  const [newCommentText, setNewCommentText] = useState('')
  const [isCommentInputFocused, setIsCommentInputFocused] = useState(false)

  // Izohlarga bosilgan like'lar
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string | number>>(new Set())

  // Izoh yozuvchi ma'lumotlari: agar foydalanuvchining kanali bo'lsa, kanal nomi va avatari bilan izoh qoldiradi
  const commentAuthorName = currentChannel?.title || user?.fullName || 'Foydalanuvchi'
  const commentAuthorAvatar = currentChannel?.avatar || user?.avatar
  const commentAuthorInitial = (commentAuthorName || 'U').charAt(0).toUpperCase()

  // Izoh qoldirish
  const handleAddComment = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }
    if (!newCommentText.trim()) return

    const newComment: CourseComment = {
      id: 'c-' + Date.now(),
      author: {
        name: commentAuthorName,
        avatar: commentAuthorAvatar,
      },
      text: newCommentText.trim(),
      createdAt: 'Hozirgina',
      likes: 0,
    }

    setCommentsByLesson((prev) => ({
      ...prev,
      [currentLesson.id]: [newComment, ...(prev[currentLesson.id] || [])],
    }))

    setNewCommentText('')
    setIsCommentInputFocused(false)
  }

  // Izohga like bosish
  const handleToggleCommentLike = (commentId: string | number) => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    setLikedCommentIds((prev) => {
      const next = new Set(prev)
      const isAlreadyLiked = next.has(commentId)

      if (isAlreadyLiked) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }

      setCommentsByLesson((prevMap) => {
        const lessonComments = (prevMap[currentLesson.id] || []).map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              likes: isAlreadyLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
            }
          }
          return c
        })
        return {
          ...prevMap,
          [currentLesson.id]: lessonComments,
        }
      })

      return next
    })
  }

  const handleToggleLike = () => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    if (likeStatus === 'liked') {
      setLikeStatus(null)
      setLikesCount((prev) => prev - 1)
    } else {
      setLikeStatus('liked')
      setLikesCount((prev) => prev + 1)
    }
  }

  const handleToggleDislike = () => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    if (likeStatus === 'disliked') {
      setLikeStatus(null)
    } else {
      if (likeStatus === 'liked') {
        setLikesCount((prev) => prev - 1)
      }
      setLikeStatus('disliked')
    }
  }

  const handleToggleSaveLesson = () => {
    if (!course || !currentLesson) return
    const res = toggleSaveLesson(currentLesson, course)
    showToast(res.message, res.isSaved ? 'success' : 'info')
  }

  const defaultLesson: CourseLesson = {
    id: 'placeholder',
    title: '',
    videoUrl: '',
    duration: '00:00',
    price: "0 so'm",
    isFree: false,
  }

  const currentLesson: CourseLesson = activeLesson || course?.videos?.[0] || defaultLesson
  const currentLessonIndex =
    course && currentLesson
      ? course.videos.findIndex((v) => String(v.id) === String(currentLesson?.id)) + 1
      : 1
  const isLessonUnlocked =
    isChannelOwner ||
    isPurchased ||
    Boolean(currentLesson.isFree) ||
    unlockedLessons.has(currentLesson.id) ||
    Boolean(user?.purchasedLessons?.includes(String(currentLesson.id)))

  // Tanlangan joriy darslikning izohlari
  const currentLessonComments = commentsByLesson[currentLesson.id] || []

  // Aynan tanlangan darsning o'z tavsifi (har bir video uchun alohida)
  const rawDescription = (currentLesson?.description || '').trim()
  const hasDescription = Boolean(rawDescription)

  // Matndan barcha heshteglarni avtomatik ajratib olish (#js, #javascript, #frontend, ...)
  const extractedHashtags = useMemo(() => {
    return hasDescription
      ? Array.from(new Set(rawDescription.match(/#[\p{L}\p{N}_]+/gu) || []))
      : []
  }, [hasDescription, rawDescription])

  // Matn ichidagi URL va heshteglarni avtomatik havolalarga aylantirish
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(https?:\/\/[^\s]+|#[\p{L}\p{N}_]+)/gu)
    return parts.map((part, index) => {
      if (/^https?:\/\//i.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline font-medium break-all transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      if (part.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-blue-500 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  // Xavfsiz DRM stream va watermarkni backenddan yuklash
  useEffect(() => {
    let isCancelled = false
    if (!isPlaying || !currentLesson) return

    const loadStream = async () => {

      try {
        const streamData = await playlistApi.getLessonStream(course?.id || courseId, currentLesson.id)
        if (isCancelled) return
        if (streamData && streamData.streamUrl) {
          setStreamUrl(streamData.streamUrl)
        } else {
          setStreamUrl(currentLesson.videoUrl || null)
        }
      } catch {
        if (!isCancelled) {
          setStreamUrl(currentLesson.videoUrl || null)
        }
      }
    }

    loadStream()
    return () => {
      isCancelled = true
    }
  }, [isPlaying, currentLesson?.id, course?.id, courseId, user])

  // Bitta dars uchun to'lov qilish
  const handlePayForLesson = async () => {
    if (!isAuthenticated) {
      openAuthModal('register')
      return
    }
    setIsProcessingPayment(true)
    try {
      await playlistApi.purchaseCourseOrLesson(course?.id || courseId, currentLesson.id)
      await checkAuth()
    } catch {
      // ignore
    }
    setUnlockedLessons((prev) => new Set([...prev, currentLesson.id]))
    setIsProcessingPayment(false)
  }

  // To'liq kurs uchun to'lov qilish
  const handlePayForFullCourse = async () => {
    if (!isAuthenticated) {
      openAuthModal('register')
      return
    }
    setIsProcessingPayment(true)
    try {
      await playlistApi.purchaseCourseOrLesson(course?.id || courseId)
      await checkAuth()
    } catch {
      // ignore
    }
    setIsFullCoursePurchased(true)
    setIsProcessingPayment(false)
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-gray-700 dark:text-zinc-300 mb-4">
          Kurs topilmadi
        </p>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga qaytish
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Yuqori orqaga qaytish paneli */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 text-sm font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Barcha kurslarga qaytish</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold rounded-full">
            {course.category || 'O\'quv kursi'}
          </span>
          <span className="text-xs px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-medium rounded-full">
            {course.videoCount} ta dars
          </span>
        </div>
      </div>

      {/* Asosiy 2 ustunli tartib: Chapda Video Player va Tafsilotlar, O'ngda Darslar Playlisti */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chap qism: Video maydoni va Kurs haqida ma'lumotlar */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* VIDEO MAYDONI */}
          <div className="relative aspect-video w-full rounded-xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-gray-200/80 dark:border-zinc-800 flex items-center justify-center">
            {isPlaying ? (
              <VideoPlayer
                url={streamUrl || currentLesson.videoUrl}
                watermark={user ? `${user.fullName || 'User'} - ${user.id || ''}` : undefined}
                title={currentLesson.title}
                poster={currentLesson.thumbnail || course.thumbnail}
                autoPlay
                className="w-full h-full"
              />
            ) : (
              <>
                {/* Fon: Video avatari / muqovasi */}
                <img
                  src={currentLesson.thumbnail || course.thumbnail}
                  alt={currentLesson?.title || course.title}
                  className={`w-full h-full object-cover transition-all duration-700 ${!isLessonUnlocked
                    ? 'scale-105 blur-xs brightness-40'
                    : 'brightness-90'
                    }`}
                />

                {/* 1. AGAR PUL TO'LANMAGAN BO'LSA: Video ustiga to'lov kartasi chiqadi */}
                {!isLessonUnlocked ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 text-center z-10 bg-black/60 backdrop-blur-xs">
                    {/* Qulf ikonka va sarlavha */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30 border border-indigo-400/40 animate-pulse">
                      <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    <span className="text-xs sm:text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Ushbu darslik pullik
                    </span>

                    {/* To'lov tugmalari bloki */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md justify-center">
                      <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={handlePayForLesson}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {isProcessingPayment
                            ? 'To\'lov tekshirilmoqda...'
                            : `Darsni xarid qilish: ${currentLesson.price}`}
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingPayment}
                        onClick={handlePayForFullCourse}
                        className="w-full sm:w-auto px-4 py-3 bg-white/10 hover:bg-white/20 active:scale-98 text-white font-semibold text-xs sm:text-sm rounded-2xl backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Tag className="w-4 h-4 text-amber-400" />
                        <span>To'liq kurs: {course.price}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 2. PUL TO'LANGAN YOKI BEPUL BO'LSA: Haqiqiy Video Player ko'rinadi */
                  <div
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 cursor-pointer group"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600/95 text-white flex items-center justify-center pl-1 shadow-2xl group-hover:scale-110 group-hover:bg-indigo-600 transition-all cursor-pointer ring-4 ring-white/30">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
                    </div>
                    {/* <div className="px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{currentLesson.isFree ? 'Namunaviy dars' : 'Darslik sotib olingan'}</span>
                    </div> */}
                  </div>
                )}

              </>
            )}

            {/* Video ustidagi yuqori badge'lar faqat ijro to'xtab turganda ko'rinadi */}
            {!isPlaying && (
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-20 pointer-events-none">
                <span className="px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5">
                  <ListVideo className="w-3.5 h-3.5 text-indigo-400" />
                  Dars {currentLessonIndex > 0 ? currentLessonIndex : 1} / {course.videos.length || course.videoCount}
                </span>
              </div>
            )}
          </div>

          {/* Tanlangan dars sarlavhasi */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/90 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug">
                {currentLesson.title}
              </h2>
            </div>
          </div>

          {/* Muallif va umumiy kurs ma'lumotlari */}
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/90 dark:border-zinc-800 shadow-xs space-y-4">
            {/* Muallif info */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <img
                  src={course.channel.avatar}
                  alt={course.channel.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-gray-900 dark:text-white">
                      {course.channel.name}
                    </span>
                    {course.channel.verified && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-600 text-white" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                    <span>
                      {course.channel.subscribers?.includes('obuna')
                        ? course.channel.subscribers
                        : `${course.channel.subscribers || '0'} obunachilar`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* Like va Dislike segmentli tugmasi (YouTube uslubida) */}
                <div className="flex items-center bg-gray-100 dark:bg-zinc-800/90 hover:bg-gray-200/70 dark:hover:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700/70 rounded-xl overflow-hidden shadow-xs transition-colors">
                  <button
                    type="button"
                    onClick={handleToggleLike}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${likeStatus === 'liked'
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60'
                      : 'text-gray-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    title="Yoqdi"
                  >
                    <ThumbsUp className={`w-4 h-4 ${likeStatus === 'liked' ? 'fill-current' : ''}`} />
                    <span>{likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}k` : likesCount}</span>
                  </button>

                  <div className="w-[1px] h-4 bg-gray-300 dark:bg-zinc-700" />

                  <button
                    type="button"
                    onClick={handleToggleDislike}
                    className={`flex items-center gap-1 px-2.5 py-2 text-xs font-semibold transition-all active:scale-95 cursor-pointer ${likeStatus === 'disliked'
                      ? 'text-red-500 bg-red-50 dark:bg-red-950/50'
                      : 'text-gray-600 dark:text-zinc-300 hover:text-red-500'
                      }`}
                    title="Yoqmadi"
                  >
                    <ThumbsDown className={`w-4 h-4 ${likeStatus === 'disliked' ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Bookmark tugmasi */}
                <button
                  type="button"
                  onClick={handleToggleSaveLesson}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    isLessonSaved(currentLesson.id)
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400'
                      : 'bg-gray-100 dark:bg-zinc-800/90 hover:bg-gray-200/70 dark:hover:bg-zinc-800 border-gray-200/80 dark:border-zinc-700/70 text-gray-700 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title={isLessonSaved(currentLesson.id) ? "Saqlanganlardan olib tashlash" : "Saqlanganlarga qo'shish"}
                >
                  <Bookmark className={`w-4 h-4 ${isLessonSaved(currentLesson.id) ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{isLessonSaved(currentLesson.id) ? 'Saqlangan' : 'Saqlash'}</span>
                </button>

                {/* Obuna Bo'lish tugmasi (Kanal egasiga hech narsa ko'rsatilmaydi) */}
                {!isChannelOwner && (
                  <button
                    type="button"
                    onClick={handleToggleSubscribe}
                    className={`group px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer min-w-[140px] ${
                      isSubscribed
                        ? 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 border border-gray-200 dark:border-zinc-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isSubscribed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:hidden" />
                        <span className="group-hover:hidden">Obunadasiz</span>
                        <span className="hidden group-hover:inline">Bekor qilish</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Obuna bo'lish</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Description (Videolar haqida tavsif, avtomatik URL va heshteglar) */}
            {hasDescription && (
              <div className="p-4 sm:p-5 bg-gray-100/90 dark:bg-zinc-800/70 border border-gray-200/80 dark:border-zinc-700/60 rounded-3xl space-y-3 transition-all">
                {/* Statistika va sanalar */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700 dark:text-zinc-300">
                  {course.totalViews && <span>{course.totalViews} ko'rishlar</span>}
                  {course.totalViews && course.lastUpdated && <span className="text-gray-400">•</span>}
                  {course.lastUpdated && <span>{course.lastUpdated}</span>}
                </div>

                {/* Avtomatik ajratib olingan Heshteglar (tepada minimalistik ajratib turiladi) */}
                {extractedHashtags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {extractedHashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Formatlangan matn (URLlar ko'k rangda, link bo'lib ishlaydi) */}
                <p
                  className={`text-xs sm:text-sm text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line ${!isDescriptionExpanded ? 'line-clamp-3' : ''
                    }`}
                >
                  {renderFormattedText(rawDescription)}
                </p>

                {/* Ko'proq / Kamroq ko'rish tugmasi */}
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 pt-1 cursor-pointer transition-colors"
                >
                  <span>{isDescriptionExpanded ? 'Kamroq ko\'rsatish' : 'Ko\'proq ko\'rish'}</span>
                  {isDescriptionExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* Izohlar (Comments) bo'limi — Har bir video darslik uchun alohida */}
            <div className="p-5 bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 rounded-3xl space-y-6 shadow-xs">
              {/* Izohlar sarlavhasi va soni */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    Izohlar ({currentLessonComments.length})
                  </h3>
                </div>
              </div>

              {/* Yangi izoh qoldirish formasi yoki login taklifi */}
              {!isAuthenticated ? (
                <div
                  onClick={() => openAuthModal('login')}
                  className="p-3.5 sm:p-4 bg-gray-50 dark:bg-zinc-800/60 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-gray-500 dark:text-zinc-400 shrink-0">
                      <LogIn className="w-4 h-4" />
                    </div>
                    <span>Izoh qoldirish uchun tizimga kiring</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openAuthModal('login')
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    Kirish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddComment} className="flex gap-3 sm:gap-4">
                  {/* Izoh yozuvchi avatari (Kanal ochilgan bo'lsa kanal avatari va nomi) */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    {commentAuthorAvatar ? (
                      <img src={commentAuthorAvatar} alt={commentAuthorName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{commentAuthorInitial}</span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <textarea
                      rows={isCommentInputFocused || newCommentText ? 3 : 1}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      onFocus={() => setIsCommentInputFocused(true)}
                      placeholder="Ushbu darslik haqida fikr yoki savolingizni yozing..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800/80 hover:bg-gray-100/70 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 border border-gray-200 dark:border-zinc-700/80 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-2xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 outline-none transition-all resize-none"
                    />

                    {/* Tugmalar paneli: bekor qilish va yuborish */}
                    {(isCommentInputFocused || newCommentText) && (
                      <div className="flex items-center justify-end gap-2 pt-1 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            setNewCommentText('')
                            setIsCommentInputFocused(false)
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
                        >
                          Bekor qilish
                        </button>
                        <button
                          type="submit"
                          disabled={!newCommentText.trim()}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Izoh qoldirish</span>
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* Mavjud izohlar ro'yxati */}
              <div className="space-y-4 pt-2">
                {currentLessonComments.length > 0 ? (
                  currentLessonComments.map((comment) => {
                    const isLiked = likedCommentIds.has(comment.id)

                    return (
                      <div
                        key={comment.id}
                        className="flex gap-3 sm:gap-4 p-3.5 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        {/* Muallif avatari */}
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                          {comment.author.avatar ? (
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{comment.author.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>

                        {/* Izoh tanasi */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                              {comment.author.name}
                            </span>
                            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
                              {comment.createdAt}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                            {comment.text}
                          </p>

                          {/* Izoh tagidagi like tugmasi */}
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => handleToggleCommentLike(comment.id)}
                              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${isLiked
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-gray-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                                }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                              <span>{comment.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="py-8 text-center text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                    <p>Ushbu darslikda hali izohlar yo'q.</p>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                      Birinchi bo'lib o'z fikringiz yoki savolingizni qoldiring!
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* O'ng qism: Playlist (Darsliklar ro'yxati) */}
        <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/90 dark:border-zinc-800 shadow-xs overflow-hidden h-fit max-h-[85vh]">
          {/* Playlist Sarlavhasi */}
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/70 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white flex items-center gap-2 truncate" title={course.title}>
                <ListVideo className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">{course.title}</span>
              </h3>
              <span className="text-xs text-gray-500 dark:text-zinc-400">
                Jami: {course.videos.length} ta dars
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isChannelOwner && onAddVideo && (
                <button
                  type="button"
                  onClick={onAddVideo}
                  title="Yangi video qo'shish"
                  className="p-1.5 hover:bg-indigo-100 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                Playlist
              </span>
            </div>
          </div>

          {/* Darslar ro'yxati */}
          <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 p-2 space-y-1">
            {/* Yuklanayotgan darslar birinchi bo'lib ko'rinadi */}
            {courseUploads.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-2xl flex items-center gap-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 animate-fadeIn"
              >
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h4>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      {task.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {course.videos.map((lesson, index) => {
              const isSelected = currentLesson.id === lesson.id
              const isUnlocked =
                isChannelOwner || isFullCoursePurchased || lesson.isFree || unlockedLessons.has(lesson.id)

              return (
                <div
                  key={lesson.id}
                  onClick={() => {
                    if (!isUnlocked && !isAuthenticated) {
                      openAuthModal('register')
                      return
                    }
                    setActiveLesson(lesson)
                  }}
                  className={`p-3 rounded-2xl flex items-start gap-3 transition-all cursor-pointer ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60 border border-transparent'
                    }`}
                >
                  {/* Qulf yoki Play holati */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isUnlocked
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                      }`}
                  >
                    {isUnlocked ? (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Dars nomi va narxi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <h4
                          className={`text-xs sm:text-sm font-semibold leading-snug line-clamp-2 ${isSelected
                            ? 'text-indigo-900 dark:text-indigo-200'
                            : 'text-gray-800 dark:text-zinc-200'
                            }`}
                        >
                          {lesson.title}
                        </h4>
                      </div>

                      {isChannelOwner && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          {onEditVideo && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditVideo(lesson)
                              }}
                              title="Videoni tahrirlash"
                              className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteVideo && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteVideo(lesson)
                              }}
                              title="Videoni o'chirish"
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-400">
                        {lesson.duration && (
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-bold text-xs shrink-0 ${isUnlocked
                          ? 'text-emerald-600 dark:text-emerald-400 text-[11px]'
                          : 'text-indigo-600 dark:text-indigo-400'
                          }`}
                      >
                        {isUnlocked ? 'Ruxsat bor' : lesson.price}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div >
  )
}
