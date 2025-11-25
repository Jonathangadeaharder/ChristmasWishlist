/**
 * Repositories Module
 *
 * The repository pattern abstracts data access, making the code more
 * testable and allowing easy switching between data sources.
 *
 * Usage:
 *   import { wishlistRepository, friendsRepository } from '@/repositories'
 *
 * For testing, you can create mock implementations of the interfaces
 * and inject them into your components/hooks.
 */

// Types
export type {
  Unsubscribe,
  IWishlistRepository,
  IGiftStatusRepository,
  IFriendsRepository,
} from './types'

// Firestore implementations (default)
export { wishlistRepository, giftStatusRepository, friendsRepository } from './firestore'
