/**
 * Firestore collection names as constants
 * Using 'as const' for type safety and autocomplete
 */
export const COLLECTIONS = {
  USERS: 'users',
  WISHLIST: 'wishlist',
  FRIENDS: 'friends',
  GIFT_STATUS: 'gift_status',
  SUGGESTIONS: 'suggestions',
} as const

/**
 * Document names within subcollections
 */
export const DOCUMENTS = {
  STATUS: 'status',
} as const

/**
 * Query keys for React Query caching
 */
export const QUERY_KEYS = {
  WISHLIST: 'wishlist',
  FRIENDS: 'friends',
  GIFT_STATUS: 'giftStatus',
  USER_PROFILE: 'userProfile',
  SEARCH_USERS: 'searchUsers',
  SUGGESTIONS: 'suggestions',
} as const

/**
 * Helper function to build collection paths
 */
export const paths = {
  users: () => COLLECTIONS.USERS,
  user: (userId: string) => `${COLLECTIONS.USERS}/${userId}`,
  wishlist: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.WISHLIST}`,
  wishlistItem: (userId: string, itemId: string) =>
    `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.WISHLIST}/${itemId}`,
  giftStatus: (userId: string, itemId: string) =>
    `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.WISHLIST}/${itemId}/${COLLECTIONS.GIFT_STATUS}/${DOCUMENTS.STATUS}`,
  friends: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.FRIENDS}`,
  friend: (userId: string, friendId: string) =>
    `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.FRIENDS}/${friendId}`,
  suggestions: (userId: string) => `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUGGESTIONS}`,
  suggestion: (userId: string, suggestionId: string) =>
    `${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.SUGGESTIONS}/${suggestionId}`,
} as const
