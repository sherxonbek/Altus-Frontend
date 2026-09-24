import { useState, useEffect, useCallback } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import { isKinescopeVideo, getKinescopeEmbedUrl } from '../../utils/videoUtils'
import { getFullMediaUrl } from '../../api/upload.api'

interface VideoPlayerProps {
  url?: string
  title?: string
  poster?: string
  autoPlay?: boolean
  className?: string
  watermark?: string
  onEnded?: () => void
}

export const VideoPlayer = ({
  url,
  title = 'Video darslik',
  poster,
  autoPlay = true,
  className = 'w-full h-full',
}: VideoPlayerProps) => {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [isSecurityAlertActive, setIsSecurityAlertActive] = useState(false)
  const isKinescope = isKinescopeVideo(url)

  // Skrinshot va ekrandan yozib olish tugmalarini aniqlash va bloklash
  const triggerSecurityShield = useCallback(() => {
    setIsSecurityAlertActive(true)
    const timeout = setTimeout(() => {
      setIsSecurityAlertActive(false)
    }, 2800)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Windows/Linux PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault()
        triggerSecurityShield()
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {})
        }
        return
      }

      // 2. macOS Cmd + Shift + 3 / 4 / 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        triggerSecurityShield()
        return
      }

      // 3. Dasturchi oynasi (DevTools) va manba kodini ochish: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['U', 'u', 'S', 's'].includes(e.key))
      ) {
        e.preventDefault()
        triggerSecurityShield()
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerSecurityShield()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [triggerSecurityShield])

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/90 text-zinc-400 text-sm">
        Video mavjud emas
      </div>
    )
  }

  if (isKinescope) {
    const embedUrl = getKinescopeEmbedUrl(url, { autoPlay })

    return (
      <div
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`relative bg-black overflow-hidden select-none ${className}`}
      >
        {/* Yuklanish indikatori */}
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

        {/* Xavfsizlik qalqoni: Skrinshot / Yozib olishga urinish aniqlanganda */}
        {isSecurityAlertActive && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md text-center p-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center mb-3">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className="text-white font-bold text-base sm:text-lg tracking-tight">
              Xavfsizlik tizimi faollashtirildi
            </h4>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-sm">
              Videoni ekrandan yozib olish, skrinshot qilish yoki yuklab olish qat'iyan man etiladi!
            </p>
          </div>
        )}

        {/* Kinescope Iframe Player (DRM Widevine & FairPlay himoyasi bilan, toza video) */}
        <iframe
          src={embedUrl || ''}
          title={title}
          allow="autoplay *; fullscreen *; picture-in-picture *; encrypted-media *;"
          allowFullScreen
          onLoad={() => setIframeLoaded(true)}
          className="w-full h-full border-0 absolute inset-0 z-1"
        />
      </div>
    )
  }

  // Standart HTML5 Video Player (Oddiy lokal yoki masofaviy mp4 fayllar uchun)
  const directVideoUrl = getFullMediaUrl(url) || 'https://www.w3schools.com/html/mov_bbb.mp4'

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`relative bg-black overflow-hidden select-none ${className}`}
    >
      {/* Xavfsizlik qalqoni */}
      {isSecurityAlertActive && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md text-center p-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center mb-3">
            <ShieldAlert className="w-8 h-8 animate-pulse" />
          </div>
          <h4 className="text-white font-bold text-base sm:text-lg tracking-tight">
            Xavfsizlik tizimi faollashtirildi
          </h4>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-sm">
            Videoni ekrandan yozib olish, skrinshot qilish yoki yuklab olish qat'iyan man etiladi!
          </p>
        </div>
      )}

      <video
        src={directVideoUrl}
        poster={poster}
        controls
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        autoPlay={autoPlay}
        playsInline
        className="w-full h-full object-contain bg-black"
      />
    </div>
  )
}
