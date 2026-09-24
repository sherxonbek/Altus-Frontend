import { useState, useEffect } from 'react'
import { Bookmark, Sparkles } from 'lucide-react'
import { playlistApi } from '../api/playlist.api'
import type { CoursePlaylist } from '../types'
import { VideoCard } from '../components/video'

export const SavedPage = () => {
  const [savedVideos, setSavedVideos] = useState<CoursePlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchPlaylists = async () => {
      setIsLoading(true)
      try {
        const playlists = await playlistApi.getAllPlaylists()
        if (isMounted) {
          setSavedVideos(playlists)
        }
      } catch (e) {
        console.error('Failed to load saved videos:', e)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPlaylists()

    return () => {
      isMounted = false
    }
  }, [])

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
            Keyinroq ko'rish uchun saqlab qo'yilgan videolar
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 animate-pulse"
            >
              <div className="w-full aspect-video bg-gray-200 dark:bg-zinc-800" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : savedVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
          {savedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 text-gray-500 dark:text-zinc-400">
          <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl">
            <Sparkles className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            Hozircha saqlangan videolar yo'q
          </p>
        </div>
      )}
    </div>
  )
}
