/**
 * Wishlist Feature Module
 *
 * Contains wishlist-related components, hooks, and types
 */

// Hooks
export {
  useWishlist,
  useAddWishlistItem,
  useDeleteWishlistItem,
  useUpdateWishlistItem,
} from '../../hooks/useWishlist'

export { useGiftStatus, useMarkItemAsTaken, useUnmarkItemAsTaken } from '../../hooks/useGiftStatus'

// Components (re-exported from existing locations)
export { WishlistForm } from '../../components/WishlistForm'
export { WishlistItemCard } from '../../components/WishlistItemCard'

// Types
export type { WishlistItem, GiftStatus } from '../../types'
