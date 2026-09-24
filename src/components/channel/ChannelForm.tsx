import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  User as UserIcon,
  Sparkles,
  Check,
  X,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useChannelStore } from '../../store/useChannelStore'

interface ChannelFormProps {
  isEditing: boolean
  onCancel?: () => void
  onSuccess?: () => void
}

const getInitials = (text: string): string => {
  if (!text || !text.trim()) return 'AK'
  const parts = text.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ChannelForm = ({ isEditing, onCancel, onSuccess }: ChannelFormProps) => {
  const { user } = useAuthStore()
  const { currentChannel, saveChannel, isUsernameAvailable } = useChannelStore()

  const [title, setTitle] = useState('')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [banner, setBanner] = useState('')
  const [description, setDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (currentChannel) {
      setTitle(currentChannel.title || '')
      setUsername(currentChannel.username ? currentChannel.username.replace('@', '') : '')
      setAvatar(currentChannel.avatar || '')
      setBanner(currentChannel.banner || '')
      setDescription(currentChannel.description || '')
    } else if (user) {
      setTitle(user.fullName || '')
      const suggestedUsername = user.fullName
        ? user.fullName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)
        : `user_${user.phone?.slice(-4) || 'altus'}`
      setUsername(suggestedUsername)
      setAvatar(user.avatar || '')
    }
  }, [currentChannel, user])

  const cleanUsername = username.trim().replace('@', '').toLowerCase()
  const usernameStatus: 'empty' | 'available' | 'taken' | 'invalid' = (() => {
    if (!cleanUsername) return 'empty'
    if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) return 'invalid'
    const isAvail = isUsernameAvailable(cleanUsername, currentChannel?.id)
    return isAvail ? 'available' : 'taken'
  })()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!title.trim()) {
      setErrorMessage("Kanal nomi (title) majburiy.")
      return
    }

    if (usernameStatus === 'empty') {
      setErrorMessage("Username majburiy.")
      return
    }

    if (usernameStatus === 'invalid') {
      setErrorMessage("Username 3-30 ta lotin harflari, raqamlar yoki _ bo'lishi kerak.")
      return
    }

    if (usernameStatus === 'taken') {
      setErrorMessage(`"${cleanUsername}" username allaqachon band qilingan. Boshqa username tanlang.`)
      return
    }

    try {
      setIsSubmitting(true)
      const res = await saveChannel({
        title: title.trim(),
        username: cleanUsername,
        avatar: avatar.trim() || undefined,
        banner: banner.trim() || undefined,
        description: description.trim() || undefined,
      })

      if (!res.success) {
        setErrorMessage(res.error || "Xatolik yuz berdi.")
        setIsSubmitting(false)
        return
      }

      setSuccessMessage("Kanal ma'lumotlari muvaffaqiyatli saqlandi!")
      setTimeout(() => {
        setSuccessMessage('')
        setIsSubmitting(false)
        onSuccess?.()
      }, 800)
    } catch (err: any) {
      setErrorMessage(err.message || "Xatolik yuz berdi.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">

      {/* Xatolik yoki Muvaffaqiyat xabarlari */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* JONLI OLDINDAN KO'RISH (Xuddi oddiy user ko'rgandek) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Jonli namuna</span>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
          {/* Orqa fon: berilmasa qop-qora fon */}
          <div className="w-full h-36 sm:h-48 md:h-56 relative bg-black flex items-center justify-center overflow-hidden">
            {banner.trim() ? (
              <img
                src={banner}
                alt="Kanal muqovasi"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-zinc-600 text-xs font-medium flex items-center gap-1.5 select-none">
                <ImageIcon className="w-4 h-4" />
                <span>Orqa fon (qora fon)</span>
              </div>
            )}
          </div>

          {/* Kanal bosh qismi (Avatar + Title + User + Description) */}
          <div className="p-5 sm:p-7 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 -mt-14 sm:-mt-16 mb-4">
              {/* Dumaloq Avatar: agar rasm berilmasa kanal title bosh harflari */}
              <div className="relative shrink-0">
                {avatar.trim() ? (
                  <img
                    src={avatar}
                    alt={title || "Kanal"}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-white dark:ring-zinc-900 shadow-xl bg-zinc-800"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-2xl sm:text-4xl flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 shadow-xl select-none">
                    {getInitials(title)}
                  </div>
                )}
              </div>

              {/* Kanal ma'lumotlari */}
              <div className="flex-1 min-w-0 pt-1 sm:pt-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">
                    {title.trim() || "Kanal nomi"}
                  </h2>
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                </div>

                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 font-medium mt-0.5">
                  @{cleanUsername || "username"} • 0 ta obunachi • 0 ta video
                </p>

                {description.trim() ? (
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                    {description}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 italic mt-1.5">
                    Kanal tavsifi kiritilmagan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MA'LUMOTLARNI KIRITISH FORMASI */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 space-y-6 shadow-xs">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-3">
            Kanal sozlamalari
          </h3>

          {/* 1. Kanal Nomi (Title - Majburiy) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Kanal nomi (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Web Dasturchi, IT Akademiya, CodeCraft Uz"
              required
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all"
            />
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Ushbu nom kanalingizning asosiy sarlavhasi sifatida ko'rsatiladi.
            </p>
          </div>

          {/* 2. Username (User - Majburiy va Oldin ishlatilmagan bo'lishi kerak) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                Kanal username (User) <span className="text-red-500">*</span>
              </label>
              {/* Username mavjudlik statusi */}
              {usernameStatus === 'available' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  Username mavjud va bo'sh
                </span>
              )}
              {usernameStatus === 'taken' && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                  <X className="w-3.5 h-3.5" />
                  Ushbu username allaqachon band
                </span>
              )}
              {usernameStatus === 'invalid' && (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  Faqat 3-30 ta lotin harflari va raqamlar
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-zinc-500 font-bold text-sm select-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="masalan: it_dasturchi"
                required
                className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 outline-none transition-all ${
                  usernameStatus === 'available'
                    ? 'border-emerald-500 focus:border-emerald-500'
                    : usernameStatus === 'taken'
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-zinc-700 focus:border-indigo-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Kanal havolasi uchun noyob identifikator (oldin hech kim foydalanmagan bo'lishi shart).
            </p>
          </div>

          {/* 3. Avatar (Rasm URL - Majburiy emas) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Kanal avatari (Rasm havolasi) — <span className="text-gray-400 font-normal">Majburiy emas</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/... (yoki bo'sh qoldiring)"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Agar rasm bermasangiz, avatar o'rniga kanal nomingizdan bosh harflar avtomatik qirqib olinadi.
            </p>
          </div>

          {/* 4. Orqa fon rasmi (Banner URL - Majburiy emas) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Orqa fon rasmi (Banner) — <span className="text-gray-400 font-normal">Majburiy emas</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <ImageIcon className="w-4 h-4" />
              </span>
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://images.unsplash.com/... (yoki bo'sh qoldiring)"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-zinc-400">
              Agar rasm kiritmasangiz, orqa fon qop-qora fon bo'lib qoladi.
            </p>
          </div>

          {/* 5. Kanal tavsifi (Description - Majburiy emas) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              Kanal haqida tavsif (Description) — <span className="text-gray-400 font-normal">Majburiy emas</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kanalingiz haqida qisqacha ma'lumot, o'rgatiladigan mavzular..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Saqlash tugmasi */}
        <div className="pt-2 flex items-center justify-end gap-3">
          {currentChannel && isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
            >
              Bekor qilish
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || usernameStatus === 'taken' || usernameStatus === 'invalid' || !title.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Saqlanmoqda...'
                : currentChannel
                ? "O'zgarishlarni saqlash"
                : "Kanalni yaratish"}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
