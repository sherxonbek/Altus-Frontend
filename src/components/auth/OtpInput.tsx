import { useEffect, useRef, type ChangeEvent, type KeyboardEvent, type ClipboardEvent } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  error?: string
}

export const OtpInput = ({
  value,
  onChange,
  length = 5,
  error,
}: OtpInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Birinchi inputga fokus berish
    inputsRef.current[0]?.focus()
  }, [])

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '')
    if (!rawVal) {
      // O'chirilganda
      const chars = value.split('')
      chars[index] = ''
      onChange(chars.join(''))
      return
    }

    const lastChar = rawVal.slice(-1)
    const chars = value.padEnd(length, ' ').split('')
    chars[index] = lastChar
    const newVal = chars.join('').trimEnd()
    onChange(newVal)

    // Keyingi inputga o'tish
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)
    const nextFocusIndex = Math.min(pastedData.length, length - 1)
    inputsRef.current[nextFocusIndex]?.focus()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex justify-center items-center gap-2.5 sm:gap-3">
        {Array.from({ length }).map((_, idx) => {
          const digit = value[idx] || ''
          return (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold rounded-xl border bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 transition-all outline-none
                ${
                  error
                    ? 'border-red-500 ring-2 ring-red-500/20'
                    : digit
                    ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-500/10'
                    : 'border-gray-300 dark:border-zinc-700 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20'
                }
              `}
            />
          )
        })}
      </div>

      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1 animate-fadeIn">
          <svg
            className="w-4 h-4 shrink-0"
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
    </div>
  )
}
