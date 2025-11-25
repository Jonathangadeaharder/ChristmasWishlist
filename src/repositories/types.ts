/**
 * Repository Types
 *
 * Defines the interface for data repositories, enabling
 * dependency injection and easier testing.
 */
import type { WishlistItem, GiftStatus, UserProfile } from '../types'

/**
 * Unsubscribe function returned by real-time listeners
 */
export type Unsubscribe = () => void

/**
 * Wishlist Repository Interface
 */
export interface IWishlistRepository {
  /**
   * Subscribe to a user's wishlist items
   */
  subscribeToWishlist(userId: string, callback: (items: WishlistItem[]) => void): Unsubscribe

  /**
   * Add a new wishlist item
   */
  addItem(userId: string, item: Omit<WishlistItem, 'id' | 'createdAt'>): Promise<WishlistItem>

  /**
   * Delete a wishlist item
   */
  deleteItem(userId: string, itemId: string): Promise<void>

  /**
   * Update a wishlist item
   */
  updateItem(userId: string, itemId: string, data: Partial<WishlistItem>): Promise<void>
}

/**
 * Gift Status Repository Interface
 */
export interface IGiftStatusRepository {
  /**
   * Subscribe to gift status for an item
   */
  subscribeToStatus(
    userId: string,
    itemId: string,
    callback: (status: GiftStatus | null) => void
  ): Unsubscribe

  /**
   * Mark an item as taken by someone
   */
  markAsTaken(userId: string, itemId: string, takenBy: string, takenByName: string): Promise<void>

  /**
   * Unmark an item (remove taken status)
   */
  unmark(userId: string, itemId: string): Promise<void>

  /**
   * Open or close split request for a gift
   */
  toggleSplitRequest(userId: string, itemId: string, open: boolean): Promise<void>

  /**
   * Request to join a split (as a pending contributor)
   */
  requestToJoinSplit(
    userId: string,
    itemId: string,
    contributorId: string,
    contributorName: string
  ): Promise<void>

  /**
   * Confirm a pending contributor
   */
  confirmContributor(userId: string, itemId: string, contributorId: string): Promise<void>

  /**
   * Remove a contributor (or leave the split)
   */
  removeContributor(userId: string, itemId: string, contributorId: string): Promise<void>
}

/**
 * Friends Repository Interface
 */
export interface IFriendsRepository {
  /**
   * Subscribe to a user's friends list
   */
  subscribeToFriends(userId: string, callback: (friends: UserProfile[]) => void): Unsubscribe

  /**
   * Search for users by email or display name
   */
  searchUsers(searchTerm: string): Promise<UserProfile[]>

  /**
   * Add a friend to a user's friends list
   */
  addFriend(userId: string, friendId: string): Promise<UserProfile>

  /**
   * Get a user's profile
   */
  getUserProfile(userId: string): Promise<UserProfile | null>

  /**
   * Check if a user is already a friend
   */
  isFriend(userId: string, friendId: string): Promise<boolean>
}
