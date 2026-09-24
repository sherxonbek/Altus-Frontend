export interface CourseComment {
  id: string | number
  author: {
    name: string
    avatar?: string
  }
  text: string
  createdAt: string
  likes: number
}

export interface CourseLesson {
  id: number | string
  title: string
  price: string
  rawPrice?: number
  fileSize?: number
  duration?: string
  isFree?: boolean
  videoUrl?: string
  thumbnail?: string
  description?: string
  comments?: CourseComment[]
}

export interface CoursePlaylist {
  id: string | number
  title: string
  thumbnail: string
  videoCount: number
  price: string
  originalPrice?: string
  category?: string
  rating?: number
  channel: {
    id?: string
    name: string
    avatar: string
    verified: boolean
    subscribers?: string
    rating?: number
    username?: string
  }
  videos: CourseLesson[]
  bestSellerPart?: string
  bestSellerViews?: string
  totalViews?: string
  salesCount?: string
  lastUpdated?: string
  likesCount?: number
  commentsCount?: number
  description?: string
  rawPrice?: number
  authorPrice?: number
}

// Moslik uchun type
export type Video = CoursePlaylist
