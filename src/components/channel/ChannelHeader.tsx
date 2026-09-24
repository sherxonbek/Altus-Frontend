import { CheckCircle2, Settings, Upload, Image as ImageIcon } from 'lucide-react'
import type { UserChannel } from '../../store/useChannelStore'

interface ChannelHeaderProps {
  channel: UserChannel
  playlistsCount: number
  totalVideosCount: number
  onEditChannel: () => void
  onUploadVideo: () => void
}

const getInitials = (text: string): string => {
  if (!text || !text.trim()) return 'AK'
  const parts = text.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ChannelHeader = ({
  channel,
  playlistsCount,
  totalVideosCount,
  onEditChannel,
  onUploadVideo,
}: ChannelHeaderProps) => {
  return (
    <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      {/* Orqa fon banneri (agar rasm berilmagan bo'lsa qop-qora fon) */}
      <div className="w-full h-44 sm:h-60 md:h-72 lg:h-80 relative bg-black flex items-center justify-center overflow-hidden">
        {channel.banner ? (
          <img
            src={channel.banner}
            alt={channel.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center text-zinc-800">
            <ImageIcon className="w-12 h-12 opacity-30" />
          </div>
        )}
      </div>

      {/* Profil ma'lumotlari: Avatar, Title, Username, Description va Harakatlar */}
      <div className="p-5 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Avatar va ma'lumotlar bloki */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 -mt-16 sm:-mt-20 md:-mt-24">
            {/* Dumaloq avatar (berilmasa kanal title bosh harflari) */}
            <div className="relative shrink-0">
              {channel.avatar ? (
                <img
                  src={channel.avatar}
                  alt={channel.title}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-2xl bg-zinc-800"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-3xl sm:text-5xl flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow-2xl select-none">
                  {getInitials(channel.title)}
                </div>
              )}
            </div>

            {/* Title va username */}
            <div className="pt-2 sm:pt-6 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white truncate">
                  {channel.title}
                </h1>
                <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950 shrink-0" />
              </div>

              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-medium mt-1">
                {channel.username} • {channel.subscribersCount} obunachilar • {playlistsCount} playlistlar • {totalVideosCount} videolar
              </p>

              {channel.description && (
                <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 mt-2.5 max-w-2xl leading-relaxed">
                  {channel.description}
                </p>
              )}
            </div>
          </div>

          {/* Kanal boshqaruv tugmalari */}
          <div className="flex items-center gap-2.5 pt-2 sm:pt-4 self-start md:self-auto">
            <button
              type="button"
              onClick={onEditChannel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all border border-gray-200 dark:border-zinc-700 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Kanalni tahrirlash</span>
            </button>
            <button
              type="button"
              onClick={onUploadVideo}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Video yuklash</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
