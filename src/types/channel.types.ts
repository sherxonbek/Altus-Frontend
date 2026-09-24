export interface Channel {
  id: string
  name: string
  avatar: string
  verified: boolean
  subscribers?: string
  rating?: number
  courseCount?: number
  description?: string
  username?: string
}
