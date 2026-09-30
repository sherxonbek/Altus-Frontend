import { useState } from 'react'
import { Bookmark, Sparkles } from 'lucide-react'
import { VideoCard, CourseDetail } from '../components/video'
import { useSavedStore } from '../store/useSavedStore'
import type { CoursePlaylist } from '../types'

interface SavedPageProps {
  onSelectCourse?: (courseId: string | number) => void
}

export const SavedPage = ({ onSelectCourse }: SavedPageProps) => {
  const savedPlaylists = useSavedStore((state) => state.savedPlaylists)
  const [selectedCourse, setSelectedCourse] = useState<CoursePlaylist | null>(null)

  const handleVideoSelect = (video: CoursePlaylist) => {
    setSelectedCourse(video)
    onSelectCourse?.(video.id)
  }

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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <Bookmark className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Saqlanganlar
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Keyinroq ko'rish uchun saqlab qo'yilgan videolar va kurslar
          </p>
        </div>
      </div>

      {savedPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
          {savedPlaylists.map((item) => (
            <VideoCard 
              key={item.playlist.id} 
              video={item.playlist} 
              onSelect={handleVideoSelect} 
            />
          ))}
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 text-gray-500 dark:text-zinc-400">
          <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            Hozircha saqlangan kurslar yo'q
          </p>
        </div>
      )}
    </div>
  )
}
