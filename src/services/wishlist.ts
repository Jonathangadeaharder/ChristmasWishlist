/**
 * Wishlist Service
 *
 * @deprecated These functions are kept for backwards compatibility.
 * New code should use the React Query hooks from src/hooks/useWishlist.ts
 * and src/hooks/useGiftStatus.ts instead.
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
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { COLLECTIONS, DOCUMENTS } from '../constants/firestore'
import type { WishlistItem, GiftStatus } from '../types'

export const getUserWishlist = (userId: string, callback: (items: WishlistItem[]) => void) => {
  const q = query(
    collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snapshot => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WishlistItem)
    callback(items)
  })
}

export const addWishlistItem = async (
  userId: string,
  item: Omit<WishlistItem, 'id' | 'createdAt'>
) => {
  return addDoc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST), {
    ...item,
    createdAt: Date.now(),
  })
}

export const deleteWishlistItem = async (userId: string, itemId: string) => {
  return deleteDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST, itemId))
}

export const updateWishlistItem = async (
  userId: string,
  itemId: string,
  data: Partial<WishlistItem>
) => {
  return updateDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST, itemId), data)
}

// Friend operations
export const getGiftStatus = (
  userId: string,
  itemId: string,
  callback: (status: GiftStatus | null) => void
) => {
  const statusRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.WISHLIST,
    itemId,
    COLLECTIONS.GIFT_STATUS,
    DOCUMENTS.STATUS
  )
  return onSnapshot(statusRef, docSnapshot => {
    if (docSnapshot.exists()) {
      callback(docSnapshot.data() as GiftStatus)
    } else {
      callback(null)
    }
  })
}

export const markItemAsTaken = async (
  userId: string,
  itemId: string,
  takenBy: string,
  takenByName: string
) => {
  const statusRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.WISHLIST,
    itemId,
    COLLECTIONS.GIFT_STATUS,
    DOCUMENTS.STATUS
  )
  return setDoc(statusRef, {
    isTaken: true,
    takenBy,
    takenByName,
  })
}

export const unmarkItemAsTaken = async (userId: string, itemId: string) => {
  const statusRef = doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.WISHLIST,
    itemId,
    COLLECTIONS.GIFT_STATUS,
    DOCUMENTS.STATUS
  )
  return deleteDoc(statusRef)
}
