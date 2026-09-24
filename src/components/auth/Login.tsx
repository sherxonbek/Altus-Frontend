import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, LogIn, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { loginSchema, type LoginFormData } from './schemas'
import { useLoginMutation } from '../../hooks/useAuthMutations'
import { useAuthStore } from '../../store/useAuthStore'

interface LoginProps {
  onSwitchToRegister?: () => void
  onSuccess?: () => void
}

export const Login = ({ onSwitchToRegister, onSuccess }: LoginProps) => {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const loginMutation = useLoginMutation()
  const user = useAuthStore((state) => state.user)

  // React Hook Form + Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
    mode: 'onTouched',
  })

  // Telefon raqamni formatlash (90 123 45 67)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 9)
    let formatted = ''
    if (numbers.length > 0) formatted += numbers.slice(0, 2)
    if (numbers.length >= 3) formatted += ' ' + numbers.slice(2, 5)
    if (numbers.length >= 6) formatted += ' ' + numbers.slice(5, 7)
    if (numbers.length >= 8) formatted += ' ' + numbers.slice(7, 9)
    return formatted
  }

  // Kirish so'rovini yuborish
  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)
    const cleanNumbers = data.phone.replace(/\D/g, '')

    try {
      await loginMutation.mutateAsync({
        phone: cleanNumbers,
        password: data.password,
      })
      setIsSuccess(true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setServerError(err.message || "Telefon raqam yoki parol noto'g'ri")
    }
  }

  // Agar muvaffaqiyatli kirilgan bo'lsa
  if (isSuccess && user) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/20">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Xush kelibsiz, {user.fullName}!
        </h3>
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Tizimga muvaffaqiyatli kirdingiz.
        </p>

        <div className="p-4 bg-gray-50 dark:bg-zinc-800/70 rounded-xl text-left text-xs space-y-1 text-gray-600 dark:text-zinc-300">
          <p>
            <strong>Telefon:</strong> +998 {user.phone}
          </p>
          <p>
            <strong>F.I.SH:</strong> {user.fullName}
          </p>
          <p>
            <strong>Rol:</strong> {user.role}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSuccess(false)}
          className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-sm font-medium rounded-xl transition-all cursor-pointer"
        >
          Boshqa hisob bilan kirish
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl transition-all">
      {/* Sarlavha */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Tizimga kirish
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Hisobingizga kirish uchun telefon raqam va parolingizni kiriting
        </p>
      </div>

      {/* Xatolik xabari */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Kirish formasi */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Telefon raqami"
          prefixText="+998"
          placeholder="90 123 45 67"
          type="tel"
          inputMode="numeric"
          value={watch('phone')}
          onChange={(e) => {
            const formatted = formatPhoneNumber(e.target.value)
            setValue('phone', formatted, { shouldValidate: true })
          }}
          error={errors.phone?.message}
          autoFocus
        />

        <Input
          label="Parol"
          placeholder="Parolingizni kiriting"
          isPassword
          {...register('password')}
          error={errors.password?.message}
          leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
        />

        {/* Qo'shimcha havolalar (Eslab qolish & Parolni unutdingizmi?) */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 dark:text-zinc-400">
            <input
              type="checkbox"
              className="w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 cursor-pointer"
            />
            <span>Meni eslab qol</span>
          </label>

          <button
            type="button"
            onClick={() => alert("Parolni tiklash funksiyasi tez kunda qo'shiladi")}
            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Parolni unutdingizmi?
          </button>
        </div>

        {/* Kirish tugmasi */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full py-3 px-4 mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loginMutation.isPending ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Ro'yxatdan o'tishga o'tish havolasi */}
      {onSwitchToRegister && (
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-zinc-800/80 text-center">
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Hisobingiz yo'qmi?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer ml-1"
            >
              Ro'yxatdan o'ting
            </button>
          </p>
        </div>
      )}
    </div>
  )
}
