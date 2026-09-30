import { useState, useEffect, useCallback, useRef } from 'react'
import type { CoursePlaylist } from '../../types'
import { VideoCard } from './VideoCard'
import { CourseDetail } from './CourseDetail'
import { Sparkles, Loader2 } from 'lucide-react'
import { playlistApi } from '../../api/playlist.api'

interface VideoFeedProps {
  onSelectCourse?: (courseId: string | number) => void
}

const PAGE_SIZE = 25

export const VideoFeed = ({ onSelectCourse }: VideoFeedProps) => {
  const [courses, setCourses] = useState<CoursePlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CoursePlaylist | null>(null)

  const observerTarget = useRef<HTMLDivElement | null>(null)
  const isLoadingMoreRef = useRef(false)

  // Dastlabki 25 ta elementni yuklash
  useEffect(() => {
    let isMounted = true

    const fetchInitialCourses = async () => {
      setIsLoading(true)
      try {
        const response = await playlistApi.getPaginatedPlaylists(1, PAGE_SIZE)
        if (isMounted) {
          setCourses(response.playlists)
          setPage(1)
          const totalPages = response.pagination?.totalPages || 1
          setHasMore(totalPages > 1 && response.playlists.length >= PAGE_SIZE)
        }
      } catch (e) {
        console.error('Failed to load courses from backend:', e)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchInitialCourses()

    return () => {
      isMounted = false
    }
  }, [])

  // Keyingi sahifadagi 25 ta elementni yuklash (Infinite Scroll)
  const loadMoreCourses = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore || isLoading) return
    isLoadingMoreRef.current = true
    setIsLoadingMore(true)

    try {
      const nextPage = page + 1
      const response = await playlistApi.getPaginatedPlaylists(nextPage, PAGE_SIZE)
      const newItems = response.playlists

      if (newItems.length > 0) {
        setCourses((prev) => {
          const existingIds = new Set(prev.map((c) => c.id))
          const filteredNew = newItems.filter((c) => !existingIds.has(c.id))
          return [...prev, ...filteredNew]
        })
        setPage(nextPage)

        const totalPages = response.pagination?.totalPages || nextPage
        if (nextPage >= totalPages || newItems.length < PAGE_SIZE) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (e) {
      console.error('Failed to load more courses:', e)
    } finally {
      isLoadingMoreRef.current = false
      setIsLoadingMore(false)
    }
  }, [hasMore, isLoading, page])

  // Pastdagi sentinel elementni kuzatuvchi IntersectionObserver
  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMoreRef.current && hasMore) {
          loadMoreCourses()
        }
      },
      {
        root: null,
        rootMargin: '250px', // Foydalanuvchi oxiriga yetishidan sal avval silliq yuklash
        threshold: 0.1,
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [loadMoreCourses, hasMore, isLoading])

  const handleSelectCourse = useCallback(
    (course: CoursePlaylist) => {
      setSelectedCourse(course)
      onSelectCourse?.(course.id)
    },
    [onSelectCourse]
  )

  // Agar kurs tanlangan bo'lsa, markazda to'liq kurs va uning darslari ro'yxatini render qilamiz
  if (selectedCourse) {
    return (
      <CourseDetail
        courseId={selectedCourse.id}
        customCourse={selectedCourse}
        onBack={() => setSelectedCourse(null)}
      />
    )
  }

  // Dastlabki yuklanish (Initial skeleton)
  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse"
            >
              <div className="w-full aspect-video bg-gray-200 dark:bg-zinc-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
                    <div className="h-2.5 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Kurslar to'plami (Course Playlists Grid) */}
      {courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
            {courses.map((course) => (
              <VideoCard
                key={course.id}
                video={course}
                onSelect={handleSelectCourse}
              />
            ))}
          </div>

          {/* Pastdagi yuklanish effekti (Infinite Scroll Loading Effect) */}
          {isLoadingMore && (
            <div className="w-full flex flex-col gap-6 pt-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={`more-skeleton-${i}`}
                    className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse"
                  >
                    <div className="w-full aspect-video bg-gray-200 dark:bg-zinc-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
                          <div className="h-2.5 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2.5 py-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>Yangi kurslar yuklanmoqda...</span>
              </div>
            </div>
          )}

          {/* IntersectionObserver kuzatuvchi elementi (Sentinel) */}
          <div ref={observerTarget} className="h-4 w-full pointer-events-none" />

          {/* Barcha kurslar tugaganda ko'rsatiladigan indikator */}
          {!hasMore && courses.length > 25 && (
            <div className="py-8 flex flex-col items-center justify-center text-center text-xs text-gray-400 dark:text-zinc-500 font-medium">
              <div className="w-12 h-0.5 bg-gray-200 dark:bg-zinc-800 rounded-full mb-2" />
              <span>Barcha mavjud kurslar koʻrsatildi ({courses.length} ta)</span>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 text-gray-500 dark:text-zinc-400">
          <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            Hozircha kurslar mavjud emas
          </p>
        </div>
      )}
    </div>
  )
}
