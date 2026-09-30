import { useNetworkStatus } from '../../hooks/useNetworkStatus'
import { WifiOff, Wifi, Sparkles } from 'lucide-react'

export const OfflineBanner = () => {
  const { isOffline, wasOffline } = useNetworkStatus()

  if (isOffline) {
    return (
      <aside aria-label="Tarmoq holati" className="bg-amber-600 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-md flex items-center justify-between sticky top-0 z-40 animate-in slide-in-from-top-2">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
            <span>
              <strong>Oflayn rejim:</strong> Internet tarmogʻi uzildi. Saqlangan videolar va keshdagi kurslardan toʻliq foydalanishingiz mumkin.
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-amber-700/60 px-2 py-0.5 rounded-full border border-amber-500/50">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Lokal kesh faol
          </span>
        </div>
      </aside>
    )
  }

  if (wasOffline) {
    return (
      <aside aria-label="Tarmoq holati" className="bg-emerald-600 text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-md sticky top-0 z-40 animate-in slide-in-from-top-2">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2 text-center">
          <Wifi className="w-4 h-4 shrink-0 text-emerald-200 animate-bounce" />
          <span>Internet aloqasi qayta tiklandi! Maʼlumotlar yangilanmoqda.</span>
        </div>
      </aside>
    )
  }

  return null
}
