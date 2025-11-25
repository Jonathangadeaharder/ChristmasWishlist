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

export interface GiftContributor {
  uid: string
  name: string
  status: 'confirmed' | 'pending' // pending = invited but not yet accepted
  joinedAt: number
}

export interface GiftStatus {
  isTaken: boolean
  takenBy: string // Primary contributor (who initiated)
  takenByName: string
  // Gift splitting support
  isSplit?: boolean
  contributors?: GiftContributor[]
  splitRequestOpen?: boolean // Whether primary is looking for people to split with
}

export interface Suggestion {
  id: string
  title: string
  description?: string
  suggestedBy: string // uid
  suggestedByName: string
  createdAt: number
}
