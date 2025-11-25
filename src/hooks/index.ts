// Wishlist hooks
export {
  useWishlist,
  useAddWishlistItem,
  useDeleteWishlistItem,
  useUpdateWishlistItem,
} from './useWishlist'

// Friends hooks
export {
  useFriends,
  useSearchUsers,
  useAddFriend,
  useUserProfile,
  createFriendError,
  isFriendError,
} from './useFriends'
export type { FriendError, FriendErrorCode } from './useFriends'

// Gift status hooks
export {
  useGiftStatus,
  useMarkItemAsTaken,
  useUnmarkItemAsTaken,
  useToggleSplitRequest,
  useRequestToJoinSplit,
  useConfirmContributor,
  useRemoveContributor,
} from './useGiftStatus'
export type { ParentCollection } from './useGiftStatus'

// Suggestions hooks
export { useSuggestions, useAddSuggestion, useDeleteSuggestion } from './useSuggestions'
