/**
 * Firestore Wishlist Repository
 *
 * Implements the IWishlistRepository interface using Firebase Firestore.
 */
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../../services/firebase'
import { COLLECTIONS } from '../../constants/firestore'
import type { WishlistItem } from '../../types'
import type { IWishlistRepository, Unsubscribe } from '../types'

export const wishlistRepository: IWishlistRepository = {
  subscribeToWishlist(userId: string, callback: (items: WishlistItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WishlistItem[]
      callback(items)
    })
  },

  async addItem(
    userId: string,
    item: Omit<WishlistItem, 'id' | 'createdAt'>
  ): Promise<WishlistItem> {
    const createdAt = Date.now()
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST), {
      ...item,
      createdAt,
    })

    return {
      id: docRef.id,
      ...item,
      createdAt,
    } as WishlistItem
  },

  async deleteItem(userId: string, itemId: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST, itemId))
  },

  async updateItem(userId: string, itemId: string, data: Partial<WishlistItem>): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST, itemId), data)
  },
}
