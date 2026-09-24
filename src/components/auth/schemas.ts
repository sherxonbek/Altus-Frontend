import { z } from 'zod'

export const DEFAULT_VERIFICATION_CODE = '12345'

// 1-BOSQICH: Telefon raqamini tekshirish sxemasi (Zod)
export const phoneStepSchema = z.object({
  phone: z
    .string()
    .min(1, "Telefon raqamini kiritish shart")
    .refine(
      (val: string): boolean => val.replace(/\D/g, '').length === 9,
      "Iltimos, telefon raqamingizni to'liq kiriting"
    ),
})

export type PhoneStepFormData = z.infer<typeof phoneStepSchema>

// 2-BOSQICH: Tasdiqlash kodini tekshirish sxemasi (Zod)
export const otpStepSchema = z.object({
  otp: z
    .string()
    .length(5, "Tasdiqlash kodi 5 ta raqam bo'lishi kerak"),
})

export type OtpStepFormData = z.infer<typeof otpStepSchema>

// 3-BOSQICH: F.I.SH va Parollarni tekshirish sxemasi (Zod)
export const detailsStepSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "F.I.SH kiritilishi shart")
      .min(5, "F.I.SH kamida 5 ta belgidan iborat bo'lishi kerak"),
    password: z
      .string()
      .min(1, "Parol kiritilishi shart")
      .min(6, "Parol 6 ta belgidan kam bo'lishi mumkin emas")
      .regex(/[a-zA-Z]/, "Parolda kamida bitta harf bo'lishi kerak")
      .regex(/\d/, "Parolda kamida bitta raqam qatnashishi kerak"),
    confirmPassword: z
      .string()
      .min(1, "Parolni tasdiqlash kiritilishi shart"),
  })
  .refine(
    (data): boolean => data.password === data.confirmPassword,
    {
      message: "Parollar bir-biriga mos kelmadi",
      path: ['confirmPassword'],
    }
  )

export type DetailsStepFormData = z.infer<typeof detailsStepSchema>

// 4-BOSQICH: Kirish (Login) tekshirish sxemasi (Zod)
export const loginSchema = z.object({
  phone: z
    .string()
    .min(1, "Telefon raqamini kiritish shart")
    .refine(
      (val: string): boolean => val.replace(/\D/g, '').length === 9,
      "Iltimos, telefon raqamingizni to'liq kiriting"
    ),
  password: z
    .string()
    .min(1, "Parolni kiritish shart"),
})

export type LoginFormData = z.infer<typeof loginSchema>
