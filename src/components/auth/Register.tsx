import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '../ui/Input'
import { OtpInput } from './OtpInput'
import {
  phoneStepSchema,
  otpStepSchema,
  detailsStepSchema,
  type PhoneStepFormData,
  type OtpStepFormData,
  type DetailsStepFormData,
} from './schemas'
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
} from '../../hooks/useAuthMutations'
import { useAuthStore } from '../../store/useAuthStore'

// Qadamlar turlari
type Step = 'PHONE' | 'OTP' | 'DETAILS' | 'SUCCESS'

export const Register = () => {
  const [currentStep, setCurrentStep] = useState<Step>('PHONE')
  const [phoneState, setPhoneState] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [receivedTestCode, setReceivedTestCode] = useState<string | null>(null)

  // TanStack Query mutatsiyalari
  const sendOtpMutation = useSendOtpMutation()
  const verifyOtpMutation = useVerifyOtpMutation()
  const registerMutation = useRegisterMutation()

  // Global auth holati (Zustand)
  const user = useAuthStore((state) => state.user)

  // 1-BOSQICH: Telefon formasi (React Hook Form + Zod)
  const phoneForm = useForm<PhoneStepFormData>({
    resolver: zodResolver(phoneStepSchema),
    defaultValues: { phone: '' },
    mode: 'onTouched',
  })

  // 2-BOSQICH: OTP kod formasi (React Hook Form + Zod)
  const otpForm = useForm<OtpStepFormData>({
    resolver: zodResolver(otpStepSchema),
    defaultValues: { otp: '' },
    mode: 'onSubmit',
  })

  // 3-BOSQICH: F.I.SH va Parol formasi (React Hook Form + Zod)
  const detailsForm = useForm<DetailsStepFormData>({
    resolver: zodResolver(detailsStepSchema),
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
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

  // 1-BOSQICH: Telefon raqamini yuborish (Backend API: POST /auth/send-otp)
  const onPhoneSubmit = async (data: PhoneStepFormData) => {
    setServerError(null)
    const cleanNumbers = data.phone.replace(/\D/g, '')

    try {
      const res = await sendOtpMutation.mutateAsync({ phone: cleanNumbers })
      setPhoneState(data.phone)
      if (res.testCode) {
        setReceivedTestCode(res.testCode)
      }
      setCurrentStep('OTP')
    } catch (err: any) {
      phoneForm.setError('phone', {
        type: 'server',
        message: err.message || "Kod yuborishda xatolik yuz berdi",
      })
    }
  }

  // 2-BOSQICH: Kodni tasdiqlash (Backend API: POST /auth/verify-otp)
  const onOtpSubmit = async (data: OtpStepFormData) => {
    setServerError(null)
    const cleanNumbers = phoneState.replace(/\D/g, '')

    try {
      await verifyOtpMutation.mutateAsync({
        phone: cleanNumbers,
        code: data.otp,
      })
      setCurrentStep('DETAILS')
    } catch (err: any) {
      otpForm.setError('otp', {
        type: 'server',
        message: err.message || "Tasdiqlash kodida xatolik",
      })
    }
  }

  // 3-BOSQICH: Ro'yxatdan o'tish (Backend API: POST /auth/register)
  const onDetailsSubmit = async (data: DetailsStepFormData) => {
    setServerError(null)
    const cleanNumbers = phoneState.replace(/\D/g, '')

    try {
      await registerMutation.mutateAsync({
        phone: cleanNumbers,
        fullName: data.fullName,
        password: data.password,
      })
      setCurrentStep('SUCCESS')
    } catch (err: any) {
      setServerError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi")
    }
  }

  // Parol talablari ko'rsatkichlari (jonli kuzatish)
  const watchedPassword = detailsForm.watch('password') || ''
  const passwordCriteria = {
    hasLetter: /[a-zA-Z]/.test(watchedPassword),
    hasNumber: /\d/.test(watchedPassword),
    longerThanSix: watchedPassword.length >= 6,
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl transition-all">
      {/* SARLAVHA VA BOSQICHLAR INDIKATORI */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Ro'yxatdan o'tish
        </h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          {currentStep === 'PHONE' && "Telefon raqamingiz orqali ro'yxatdan o'ting"}
          {currentStep === 'OTP' && "Telegram ilovangizga yuborilgan kodni kiriting"}
          {currentStep === 'DETAILS' && "Shaxsiy ma'lumotlaringiz va parolingizni kiriting"}
          {currentStep === 'SUCCESS' && "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi"}
        </p>

        {/* Bosqichlar ko'rsatkichi chiziqlari */}
        {currentStep !== 'SUCCESS' && (
          <div className="flex items-center justify-center gap-2 mt-5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep === 'PHONE'
                  ? 'w-8 bg-indigo-600'
                  : 'w-4 bg-indigo-500/40'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep === 'OTP'
                  ? 'w-8 bg-indigo-600'
                  : currentStep === 'DETAILS'
                  ? 'w-4 bg-indigo-500/40'
                  : 'w-4 bg-gray-200 dark:bg-zinc-800'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentStep === 'DETAILS'
                  ? 'w-8 bg-indigo-600'
                  : 'w-4 bg-gray-200 dark:bg-zinc-800'
              }`}
            />
          </div>
        )}
      </div>

      {/* Server umumiy xatolik xabari */}
      {serverError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* ---------------- 1-BOSQICH: TELEFON RAQAM (API) ---------------- */}
      {currentStep === 'PHONE' && (
        <form
          onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
          className="space-y-5"
        >
          <Input
            label="Telefon raqami"
            prefixText="+998"
            placeholder="90 123 45 67"
            type="tel"
            inputMode="numeric"
            value={phoneForm.watch('phone')}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value)
              phoneForm.setValue('phone', formatted, { shouldValidate: true })
            }}
            error={phoneForm.formState.errors.phone?.message}
            autoFocus
          />

          <button
            type="submit"
            disabled={sendOtpMutation.isPending}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {sendOtpMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Kodni yuborish</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </form>
      )}

      {/* ---------------- 2-BOSQICH: 5 TALIK KOD (OTP - API) ---------------- */}
      {currentStep === 'OTP' && (
        <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
          {/* Telegram orqali yuborilganlik bildirishnomasi */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl text-sky-800 dark:text-sky-300 text-xs flex items-start gap-2.5">
            <svg
              className="w-4 h-4 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
            </svg>
            <div>
              <p className="font-semibold">Telegram (Verification Codes):</p>
              <p className="mt-0.5">
                Tasdiqlash kodi Telegram ilovangizdagi rasmiy <strong>Verification Codes</strong> chatiga yuborildi.
              </p>
              {receivedTestCode && (
                <p className="mt-1 text-sky-600 dark:text-sky-400 font-mono">
                  (Test kodi: <strong>{receivedTestCode}</strong>)
                </p>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Kod yuborildi:{' '}
              <span className="font-semibold text-gray-800 dark:text-zinc-200">
                +998 {phoneState}
              </span>{' '}
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('PHONE')
                  otpForm.reset()
                }}
                className="text-indigo-600 hover:underline ml-1 font-medium text-xs cursor-pointer"
              >
                O'zgartirish
              </button>
            </p>
          </div>

          <Controller
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={field.onChange}
                length={5}
                error={otpForm.formState.errors.otp?.message}
              />
            )}
          />

          <button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {verifyOtpMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Tasdiqlash</span>
            )}
          </button>

          {receivedTestCode && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  otpForm.setValue('otp', receivedTestCode, {
                    shouldValidate: true,
                  })
                }}
                className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
              >
                Kodni avtomatik to'ldirish
              </button>
            </div>
          )}
        </form>
      )}

      {/* ---------------- 3-BOSQICH: F.I.SH VA PAROL (API) ---------------- */}
      {currentStep === 'DETAILS' && (
        <form
          onSubmit={detailsForm.handleSubmit(onDetailsSubmit)}
          className="space-y-4"
        >
          <Input
            label="F.I.SH (To'liq ismingiz)"
            placeholder="Aliyev Vali Karim o'g'li"
            {...detailsForm.register('fullName')}
            error={detailsForm.formState.errors.fullName?.message}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            autoFocus
          />

          <Input
            label="Parol"
            placeholder="Yangi parol kiriting"
            isPassword
            {...detailsForm.register('password')}
            error={detailsForm.formState.errors.password?.message}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />

          {/* Parol talablari ko'rsatkichi (Checklist) */}
          <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl space-y-1.5 text-xs">
            <p className="font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Parol xavfsizligi shartlari:
            </p>

            {/* 1. Kamida bitta harf */}
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                passwordCriteria.hasLetter
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}
            >
              {passwordCriteria.hasLetter ? (
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 ml-1.5 mr-1" />
              )}
              <span>Kamida bitta harf bo'lishi kerak</span>
            </div>

            {/* 2. Kamida bitta raqam */}
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                passwordCriteria.hasNumber
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}
            >
              {passwordCriteria.hasNumber ? (
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 ml-1.5 mr-1" />
              )}
              <span>Raqam qatnashishi kerak</span>
            </div>

            {/* 3. Kamida 6 ta belgi */}
            <div
              className={`flex items-center gap-1.5 transition-colors ${
                passwordCriteria.longerThanSix
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-gray-500 dark:text-zinc-400'
              }`}
            >
              {passwordCriteria.longerThanSix ? (
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 ml-1.5 mr-1" />
              )}
              <span>Parol 6 ta belgidan kam bo'lmasligi kerak</span>
            </div>
          </div>

          <Input
            label="Parolni tasdiqlash"
            placeholder="Parolni qayta kiriting"
            isPassword
            {...detailsForm.register('confirmPassword')}
            error={detailsForm.formState.errors.confirmPassword?.message}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
          />

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-3 px-4 mt-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {registerMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Ro'yxatdan o'tishni yakunlash</span>
            )}
          </button>
        </form>
      )}

      {/* ---------------- 4-BOSQICH: MUVAFFAQIYATLI (SUCCESS) ---------------- */}
      {currentStep === 'SUCCESS' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-900/20">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Tabriklaymiz, {user?.fullName || "Foydalanuvchi"}!
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-300">
            Siz muvaffaqiyatli ro'yxatdan o'tdingiz.
          </p>

          <div className="p-4 bg-gray-50 dark:bg-zinc-800/70 rounded-xl text-left text-xs space-y-1 text-gray-600 dark:text-zinc-300">
            <p>
              <strong>Telefon:</strong> +998 {user?.phone || phoneState}
            </p>
            <p>
              <strong>F.I.SH:</strong> {user?.fullName}
            </p>
            <p>
              <strong>Foydalanuvchi ID:</strong> {user?.id}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              phoneForm.reset()
              otpForm.reset()
              detailsForm.reset()
              setPhoneState('')
              setServerError(null)
              setReceivedTestCode(null)
              setCurrentStep('PHONE')
            }}
            className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 text-sm font-medium rounded-xl transition-all cursor-pointer"
          >
            Boshidan boshlash
          </button>
        </div>
      )}
    </div>
  )
}
