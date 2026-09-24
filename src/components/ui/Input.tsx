import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  prefixText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  isPassword?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      prefixText,
      leftIcon,
      rightIcon,
      isPassword = false,
      type = 'text',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center rounded-xl shadow-xs transition-all duration-200">
          {/* Prefiks (masalan: +998) */}
          {prefixText && (
            <div className="flex items-center pl-3.5 pr-2 py-2.5 bg-gray-50 dark:bg-zinc-800 border-y border-l border-gray-300 dark:border-zinc-700 rounded-l-xl text-gray-700 dark:text-gray-200 font-semibold text-sm select-none">
              {prefixText}
            </div>
          )}

          {/* Prefiks bo'lmaganda chap tomondagi belgi (ikonka) */}
          {!prefixText && leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`w-full py-2.5 text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-zinc-500 border transition-all duration-150 outline-none
              ${
                prefixText
                  ? 'rounded-r-xl border-y border-r border-gray-300 dark:border-zinc-700 pl-3 pr-3.5'
                  : 'rounded-xl border-gray-300 dark:border-zinc-700 ' +
                    (leftIcon ? 'pl-10' : 'pl-3.5') +
                    ' ' +
                    (rightIcon || isPassword ? 'pr-10' : 'pr-3.5')
              }
              ${
                error
                  ? '!border-red-500 ring-2 ring-red-500/20'
                  : 'focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 dark:focus:border-indigo-400'
              }
              ${className}
            `}
            {...props}
          />

          {/* Parolni ko'rsatish / yashirish tugmasi */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Parolni yashirish' : 'Parolni koʻrsatish'}
            >
              {showPassword ? (
                // Yashirish belgisi (ko'z yopiq)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                  />
                </svg>
              ) : (
                // Ko'rsatish belgisi (ko'z ochiq)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Parol bo'lmaganda o'ng tomondagi belgi (ikonka) */}
          {!isPassword && rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Xatolik xabari */}
        {error && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-0.5 animate-fadeIn">
            <svg
              className="w-3.5 h-3.5 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        )}

        {/* Yordamchi matn */}
        {!error && helperText && (
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
