/**
 * Video va Kinescope URL bilan ishlash uchun utilitar funksiyalar
 */

/**
 * Matndan Kinescope video ID yoki Embed URL sini ajratib oladi.
 * Masalan:
 * - https://kinescope.io/embed/dAjrfD8kE5psboizhCtwSR
 * - https://kinescope.io/dAjrfD8kE5psboizhCtwSR
 * - <iframe src="https://kinescope.io/embed/..." ...>
 * - dAjrfD8kE5psboizhCtwSR
 */
export const extractKinescopeId = (rawUrl?: string): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()

  // 1. Agar to'liq <iframe> kiritilgan bo'lsa
  const iframeMatch = trimmed.match(/src=["'](https:\/\/kinescope\.io\/embed\/[^"']+)["']/)
  if (iframeMatch && iframeMatch[1]) {
    return extractKinescopeId(iframeMatch[1])
  }

  // 2. Kinescope embed URL: https://kinescope.io/embed/{id}
  const embedMatch = trimmed.match(/kinescope\.io\/embed\/([a-zA-Z0-9_-]+)/i)
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1]
  }

  // 3. Kinescope to'g'ridan-to'g'ri link: https://kinescope.io/{id}
  const directMatch = trimmed.match(/kinescope\.io\/([a-zA-Z0-9_-]+)/i)
  if (directMatch && directMatch[1] && directMatch[1] !== 'embed') {
    return directMatch[1]
  }

  // 4. Kinescope ID formati (masalan 22 ta belgili base58/base62 ID yoki UUID)
  // Masalan: dAjrfD8kE5psboizhCtwSR yoki 65f85035-1d24-42e0-ad3d-d6edfd0102f5
  const isKinescopeIdPattern = /^[a-zA-Z0-9_-]{18,36}$/.test(trimmed)
  if (isKinescopeIdPattern && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed
  }

  return null
}

/**
 * Berilgan havola Kinescope videosimi yoki yo'qligini tekshiradi
 */
export const isKinescopeVideo = (rawUrl?: string): boolean => {
  return Boolean(extractKinescopeId(rawUrl))
}

/**
 * Kinescope Iframe Embed URL hosil qiladi
 */
export const getKinescopeEmbedUrl = (
  rawUrl?: string,
  options?: { autoPlay?: boolean; dnt?: boolean; watermark?: string }
): string | null => {
  const id = extractKinescopeId(rawUrl)
  if (!id) return null

  // Agar URL da avvaldan query parametrlar bo'lsa (masalan drmauthtoken, watermark), ularni saqlaymiz
  let params = new URLSearchParams()
  if (rawUrl && rawUrl.includes('?')) {
    const qIndex = rawUrl.indexOf('?')
    params = new URLSearchParams(rawUrl.substring(qIndex + 1))
  }

  if (options?.autoPlay) {
    params.set('autoplay', '1')
  }
  if (options?.dnt !== false) {
    // Do Not Track / maxfiylik
    params.set('dnt', '1')
  }
  params.delete('watermark')

  const queryString = params.toString()
  return `https://kinescope.io/embed/${id}${queryString ? `?${queryString}` : ''}`
}

