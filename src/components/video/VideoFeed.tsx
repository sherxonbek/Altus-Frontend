import { useState, useEffect } from 'react'
import type { CoursePlaylist } from '../../types'
import { VideoCard } from './VideoCard'
import { CourseDetail } from './CourseDetail'
import { Sparkles } from 'lucide-react'
import { playlistApi } from '../../api/playlist.api'

interface VideoFeedProps {
  onSelectCourse?: (courseId: string | number) => void
}

export const VideoFeed = ({ onSelectCourse }: VideoFeedProps) => {
  const [courses, setCourses] = useState<CoursePlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<CoursePlaylist | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchCourses = async () => {
      setIsLoading(true)
      try {
        const backendCourses = await playlistApi.getAllPlaylists()
        if (isMounted) {
          setCourses(backendCourses || [])
        }
      } catch (e) {
        console.error('Failed to load courses from backend:', e)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchCourses()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectCourse = (course: CoursePlaylist) => {
    setSelectedCourse(course)
    onSelectCourse?.(course.id)
  }

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

  if (isLoading) {
    return (
      <div className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <VideoCard
              key={course.id}
              video={course}
              onSelect={handleSelectCourse}
            />
          ))}
        </div>
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
