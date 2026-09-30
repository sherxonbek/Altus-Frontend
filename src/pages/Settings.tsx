import { useState, useEffect } from 'react'
import {
  User as UserIcon,
  Tv2,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Camera,
  // ExternalLink,
} from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useChannelStore } from '../store/useChannelStore'
import { ChannelForm } from '../components/channel/ChannelForm'
import type { PageType } from '../components/layout'

interface SettingsPageProps {
  onNavigate?: (page: PageType) => void
  initialTab?: 'profile' | 'channel'
}

export const SettingsPage = ({ onNavigate, initialTab = 'profile' }: SettingsPageProps) => {
  const { user, isAuthenticated, openAuthModal, updateProfile } = useAuthStore()
  const { currentChannel, loadUserChannel } = useChannelStore()

  const [activeTab, setActiveTab] = useState<'profile' | 'channel'>(initialTab)

  // Profil tahrirlash holatlari
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [avatarUrlInput, setAvatarUrlInput] = useState('')
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false)

  // Parol o'zgartirish holatlari
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Holat xabarlari
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')
  const [profileErrorMsg, setProfileErrorMsg] = useState('')

  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('')
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('')

  const userId = user?.id || (user as any)?._id?.toString()
  const hasChannel = Boolean(currentChannel)

  // Foydalanuvchi kanalini yangilab olish
  useEffect(() => {
    if (userId) {
      loadUserChannel(userId)
    }
  }, [userId, loadUserChannel])

  // User ma'lumotlari yangilanganda formani sinxronlash (React 19 idiomatic pattern)
  const [prevUser, setPrevUser] = useState(user)
  if (user !== prevUser) {
    setPrevUser(user)
    if (user) {
      setFullName(user.fullName || '')
      setAvatar(user.avatar || '')
    }
  }

  // Agar kanal yo'q bo'lsa va tab 'channel' bo'lsa, 'profile' tabini hisoblash
  const effectiveTab = !hasChannel && activeTab === 'channel' ? 'profile' : activeTab

  // Tizimga kirmagan bo'lsa
  if (!isAuthenticated || !user) {
    return (
      <div className="w-full max-w-lg mx-auto py-16 px-6 text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-xs">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Sozlamalardan foydalanish
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-1.5">
            Profil va hisob sozlamalarini boshqarish uchun tizimga kiring
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Tizimga kirish
          </button>
        </div>
      </div>
    )
  }

  // Ism va familiya bosh harflari
  const getInitials = (name?: string): string => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Telefon raqamni chiroyli formatlash: 901234567 -> +998 (90) 123-45-67
  const formatPhoneNumber = (phoneStr?: string) => {
    if (!phoneStr) return ''
    const clean = phoneStr.replace(/\D/g, '')
    const digits = clean.startsWith('998') ? clean.slice(3) : clean
    if (digits.length === 9) {
      return `+998 (${digits.slice(0, 2)}) ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7, 9)}`
    }
    return phoneStr.startsWith('+') ? phoneStr : `+998 ${phoneStr}`
  }

  // Rasmni kompyuterdan tanlash (base64)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg("Faqat rasm formatidagi fayllarni yuklashingiz mumkin.")
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setProfileErrorMsg("Rasm hajmi 3MB dan oshmasligi kerak.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result)
        setProfileErrorMsg('')
      }
    }
    reader.readAsDataURL(file)
  }

  // Profil ma'lumotlarini saqlash
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileErrorMsg('')
    setProfileSuccessMsg('')

    if (!fullName.trim()) {
      setProfileErrorMsg("Ism va familiya maydoni bo'sh bo'lmasligi kerak")
      return
    }

    try {
      setIsSavingProfile(true)
      const res = await updateProfile({
        fullName: fullName.trim(),
        avatar: avatar.trim(),
      })

      if (res.success) {
        setProfileSuccessMsg("Profil ma'lumotlari muvaffaqiyatli saqlandi!")
        setTimeout(() => setProfileSuccessMsg(''), 3000)
      } else {
        setProfileErrorMsg(res.message || "Xatolik yuz berdi")
      }
    } catch (err: any) {
      setProfileErrorMsg(err.response?.data?.message || err.message || "Xatolik yuz berdi")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Parolni yangilash
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrorMsg('')
    setPasswordSuccessMsg('')

    if (!oldPassword) {
      setPasswordErrorMsg("Joriy parolingizni kiriting")
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("Yangi parollar bir-biriga mos kelmadi")
      return
    }

    try {
      setIsSavingPassword(true)
      const res = await updateProfile({
        oldPassword,
        newPassword,
      })

      if (res.success) {
        setPasswordSuccessMsg("Parol muvaffaqiyatli yangilandi!")
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setPasswordSuccessMsg(''), 3000)
      } else {
        setPasswordErrorMsg(res.message || "Xatolik yuz berdi")
      }
    } catch (err: any) {
      setPasswordErrorMsg(err.response?.data?.message || err.message || "Xatolik yuz berdi")
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* 1. Sarlavha (Header) */}
      <div className="border-b border-gray-200 dark:border-zinc-800">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <span>Sozlamalar</span>
        </h1>
      </div>

      {/* 2. Bo'limlar (Tabs Switcher) */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-zinc-900 rounded-2xl w-full sm:w-fit overflow-x-auto whitespace-nowrap border border-gray-200/80 dark:border-zinc-800 [&::-webkit-scrollbar]:hidden">
        {/* Profil Sozlamalari (Har doim ko'rinadi) */}
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
            effectiveTab === 'profile'
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <UserIcon className={`w-4 h-4 ${effectiveTab === 'profile' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span>Profil sozlamalari</span>
        </button>

        {/* Kanal Sozlamalari (FAQAT kanal mavjud bo'lsa ko'rinadi) */}
        {hasChannel && (
          <button
            type="button"
            onClick={() => setActiveTab('channel')}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              effectiveTab === 'channel'
                ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Tv2 className={`w-4 h-4 ${effectiveTab === 'channel' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
            <span>Kanal sozlamalari</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Kanal faol" />
          </button>
        )}
      </div>

      {/* 3. TAB 1: PROFIL SOZLAMALARI */}
      {effectiveTab === 'profile' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Shaxsiy Ma'lumotlar Formasi */}
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 space-y-6 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Shaxsiy ma'lumotlar
                </h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                  Ismingiz va profilingiz avatar rasmini o'zgartiring
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{user.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'}</span>
              </span>
            </div>

            {/* Xabarlar */}
            {profileErrorMsg && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
            )}
            {profileSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Avatar bloki */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
              <div className="relative group shrink-0">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={fullName || user.fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-gray-100 dark:ring-zinc-800 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center ring-4 ring-gray-100 dark:ring-zinc-800 shadow-md select-none">
                    {getInitials(fullName || user.fullName)}
                  </div>
                )}

                <label
                  htmlFor="profile-avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full cursor-pointer shadow-lg transition-transform active:scale-90"
                  title="Kompyuterdan rasm tanlash"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    id="profile-avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="profile-avatar-upload"
                    className="px-3.5 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Rasm yuklash
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowAvatarUrlInput((prev) => !prev)}
                    className="px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Havola orqali kiritish
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:underline font-medium cursor-pointer"
                    >
                      Rasmni o'chirish
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                  JPG, PNG yoki WEBP formatidagi rasm (maksimal 3MB).
                </p>

                {showAvatarUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                    <input
                      type="url"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      placeholder="https://misol.com/rasm.jpg"
                      className="px-3 py-1.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none w-64 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (avatarUrlInput.trim()) {
                          setAvatar(avatarUrlInput.trim())
                          setAvatarUrlInput('')
                          setShowAvatarUrlInput(false)
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
                    >
                      Qo'llash
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Form maydonlari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Ism va Familiya */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Ism va familiya <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aliyev Vali"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                />
              </div>

              {/* Telefon Raqam (Tasdiqlangan) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Telefon raqam
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatPhoneNumber(user.phone)}
                    disabled
                    className="w-full px-4 py-2.5 bg-gray-100/70 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-800 rounded-xl text-sm text-gray-500 dark:text-zinc-400 cursor-not-allowed select-none pr-28"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tasdiqlangan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saqlash tugmasi */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingProfile ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}</span>
              </button>
            </div>
          </form>

          {/* Xavfsizlik va Parol O'zgartirish */}
          <form
            onSubmit={handleUpdatePassword}
            className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 space-y-6 shadow-xs"
          >
            <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Xavfsizlik va parol</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Hisobingiz xavfsizligini ta'minlash uchun parolingizni yangilang
              </p>
            </div>

            {passwordErrorMsg && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}
            {passwordSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Joriy parol */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Joriy parol <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                />
              </div>

              {/* Yangi parol */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Yangi parol <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                />
              </div>

              {/* Yangi parolni takrorlash */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Yangi parolni takrorlang <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingPassword || !oldPassword || !newPassword}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white disabled:opacity-40 text-white dark:text-gray-900 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>{isSavingPassword ? "Yangilanmoqda..." : "Parolni yangilash"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB 2: KANAL SOZLAMALARI (Faqat kanal ochilgan bo'lsa) */}
      {effectiveTab === 'channel' && currentChannel && (
        <div className="space-y-6 animate-fadeIn">

          {/* Kanal tahrirlash formasi (avval kanal sahifasida turgan shakl) */}
          <ChannelForm
            isEditing={true}
            onCancel={() => onNavigate?.('channel')}
            onSuccess={() => {
              if (userId) {
                loadUserChannel(userId)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}
