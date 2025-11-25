export interface UserProfile {
  uid: string
  email: string
  displayName?: string
}

export interface WishlistItem {
  id: string
  title: string
  description?: string
  url?: string
  price?: string
  priority: 'low' | 'medium' | 'high'
  createdAt: number
}

export interface GiftStatus {
  isTaken: boolean
  takenBy: string
  takenByName: string
}

export interface Suggestion {
  id: string
  title: string
  description?: string
  suggestedBy: string // uid
  suggestedByName: string
  createdAt: number
}
