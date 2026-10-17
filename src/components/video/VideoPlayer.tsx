import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, ShieldAlert, Coins } from 'lucide-react'
import { isKinescopeVideo, getKinescopeEmbedUrl } from '../../utils/videoUtils'
import { getFullMediaUrl } from '../../api/upload.api'
import { useAuthStore } from '../../store/useAuthStore'

export type StreamQuality = '360p' | '720p' | '1080p'

interface VideoPlayerProps {
  url?: string
  title?: string
  poster?: string
  autoPlay?: boolean
  className?: string
  watermark?: string
  playlistId?: string | number
  lessonId?: string | number
  onEnded?: () => void
  onOutOfCoins?: () => void
}

export const VideoPlayer = ({
  url,
  title = 'Video darslik',
  poster,
  autoPlay = true,
  className = 'w-full h-full',
  watermark: _watermark,
  playlistId,
  lessonId,
  onEnded,
  onOutOfCoins,
}: VideoPlayerProps) => {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [isSecurityAlertActive, setIsSecurityAlertActive] = useState(false)
  const isKinescope = isKinescopeVideo(url)

  const { isAuthenticated, user, setCoins } = useAuthStore()
  const quality: StreamQuality = '720p'
  const [isOutOfCoins, setIsOutOfCoins] = useState(() => Boolean(user && (user.coins || 0) < 1))
  const [isPlaying, setIsPlaying] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

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
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault()
        triggerSecurityShield()
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('').catch(() => {})
        }
        return
      }

      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault()
        triggerSecurityShield()
        return
      }

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

  // Kinescope iframe voqealarini tinglash (Play / Pause sinxronizatsiyasi)
  useEffect(() => {
    if (!isKinescope) return

    const handleMessage = (event: MessageEvent) => {
      try {
        let msg = event.data
        if (typeof msg === 'string') {
          msg = JSON.parse(msg)
        }
        if (!msg || typeof msg !== 'object') return

        const evt = msg.event || msg.type
        if (evt === 'pause' || evt === 'ended') {
          setIsPlaying(false)
        } else if (evt === 'play' || evt === 'playing') {
          if (!isOutOfCoins) {
            setIsPlaying(true)
          }
        }
      } catch {
        // e'tiborsiz qoldirish
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [isKinescope, isOutOfCoins])

  const wsRef = useRef<WebSocket | null>(null)

  // Real-time WebSocket orqali stream hisoblash va coin yechish
  useEffect(() => {
    if (!isAuthenticated || isOutOfCoins) return

    const token = localStorage.getItem('token')
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.hostname === 'localhost' ? 'localhost:5000' : window.location.host
    const wsUrl = `${protocol}//${host}/stream-ws?token=${encodeURIComponent(token)}`

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('⚡ [WS Stream] Serverga ulanish muvaffaqiyatli')
      if (isPlaying) {
        ws.send(
          JSON.stringify({
            type: 'START',
            quality,
            playlistId,
            lessonId,
          })
        )
      }
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'DEDUCTED') {
          if (data.coins !== undefined) {
            setCoins(data.coins)
          }
        } else if (data.type === 'OUT_OF_COINS') {
          setIsOutOfCoins(true)
          if (videoRef.current) {
            videoRef.current.pause()
          }
          onOutOfCoins?.()
        }
      } catch (err) {
        console.error('[WS Parse Error]', err)
      }
    }

    ws.onerror = (err) => {
      console.warn('[WS Stream Error]', err)
    }

    ws.onclose = () => {
      console.log('🔌 [WS Stream] Ulanish uzildi')
    }

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'STOP' }))
      }
      ws.close()
      wsRef.current = null
    }
  }, [isAuthenticated, isOutOfCoins, playlistId, lessonId, setCoins, onOutOfCoins])

  // Ijro holati o'zgarganda (Play / Pause) WebSocketga xabar berish
  useEffect(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return

    if (isPlaying) {
      ws.send(
        JSON.stringify({
          type: 'START',
          quality,
          playlistId,
          lessonId,
        })
      )
    } else {
      ws.send(JSON.stringify({ type: 'PAUSE' }))
    }
  }, [isPlaying, quality, playlistId, lessonId])

  // Foydalanuvchi balansi 0 ga tushganda videoni to'xtatish yoki to'ldirilganda qayta faollashtirish
  useEffect(() => {
    if (user && (user.coins || 0) < 1) {
      setIsOutOfCoins(true)
      setIsPlaying(false)
      if (videoRef.current) {
        videoRef.current.pause()
      }
    } else if (user && (user.coins || 0) >= 1 && isOutOfCoins) {
      setIsOutOfCoins(false)
    }
  }, [user?.coins, isOutOfCoins])

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/90 text-zinc-400 text-sm">
        Video mavjud emas
      </div>
    )
  }

  // Tangalar tugaganda chiqadigan to'xtatish ekrani
  const outOfCoinsOverlay = isOutOfCoins ? (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md text-center p-6 animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-3">
        <Coins className="w-8 h-8 animate-bounce" />
      </div>
      <h4 className="text-white font-black text-lg sm:text-xl tracking-tight">
        Tangalaringiz (coin) tugadi!
      </h4>
      <p className="text-zinc-300 text-xs sm:text-sm mt-1 max-w-md">
        Videoni ko‘rishni davom ettirish uchun balansingizni toʻldiring.
      </p>
      <button
        type="button"
        onClick={() => onOutOfCoins?.()}
        className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 cursor-pointer transition-all"
      >
        <Coins className="w-4 h-4" />
        <span>Hisobni toʻldirish (+🪙)</span>
      </button>
    </div>
  ) : null

  if (isKinescope) {
    const embedUrl = getKinescopeEmbedUrl(url, { autoPlay: !isOutOfCoins && autoPlay })

    return (
      <div
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={`relative bg-black overflow-hidden select-none ${className}`}
      >
        {outOfCoinsOverlay}

        {/* Yuklanish indikatori */}
        {!iframeLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs gap-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        )}

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

        {/* Kinescope Iframe Player */}
        <iframe
          src={embedUrl || ''}
          title={title}
          allow="autoplay *; fullscreen *; picture-in-picture *; encrypted-media *;"
          allowFullScreen
          onLoad={() => {
            setIframeLoaded(true)
            setIsPlaying(true)
          }}
          className="w-full h-full border-0 absolute inset-0 z-1"
        />
      </div>
    )
  }

  // Standart HTML5 Video Player
  const directVideoUrl = url.startsWith('blob:')
    ? url
    : getFullMediaUrl(url) || 'https://www.w3schools.com/html/mov_bbb.mp4'

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`relative bg-black overflow-hidden select-none ${className}`}
    >
      {outOfCoinsOverlay}

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
        ref={videoRef}
        src={directVideoUrl}
        poster={poster}
        controls={!isOutOfCoins}
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        autoPlay={!isOutOfCoins && autoPlay}
        playsInline
        onPlay={() => {
          if (isOutOfCoins || (user && (user.coins || 0) < 1)) {
            videoRef.current?.pause()
            setIsOutOfCoins(true)
            setIsPlaying(false)
            onOutOfCoins?.()
            return
          }
          setIsPlaying(true)
        }}
        onPlaying={() => {
          if (isOutOfCoins || (user && (user.coins || 0) < 1)) {
            videoRef.current?.pause()
            setIsOutOfCoins(true)
            setIsPlaying(false)
            onOutOfCoins?.()
            return
          }
          setIsPlaying(true)
        }}
        onTimeUpdate={() => {
          if (isOutOfCoins || (user && (user.coins || 0) < 1)) {
            videoRef.current?.pause()
            setIsOutOfCoins(true)
            setIsPlaying(false)
            return
          }
          if (!isPlaying) setIsPlaying(true)
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          onEnded?.()
        }}
        className="w-full h-full object-contain bg-black"
      />
    </div>
  )
}

