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
import type { WishlistItem, GiftStatus } from '../types'

export const getUserWishlist = (userId: string, callback: (items: WishlistItem[]) => void) => {
  const q = query(collection(db, 'users', userId, 'wishlist'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snapshot => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as WishlistItem)
    callback(items)
  })
}

export const addWishlistItem = async (
  userId: string,
  item: Omit<WishlistItem, 'id' | 'createdAt'>
) => {
  return addDoc(collection(db, 'users', userId, 'wishlist'), {
    ...item,
    createdAt: Date.now(),
  })
}

export const deleteWishlistItem = async (userId: string, itemId: string) => {
  return deleteDoc(doc(db, 'users', userId, 'wishlist', itemId))
}

export const updateWishlistItem = async (
  userId: string,
  itemId: string,
  data: Partial<WishlistItem>
) => {
  return updateDoc(doc(db, 'users', userId, 'wishlist', itemId), data)
}

// Friend operations
export const getGiftStatus = (
  userId: string,
  itemId: string,
  callback: (status: GiftStatus | null) => void
) => {
  return onSnapshot(doc(db, 'users', userId, 'wishlist', itemId, 'gift_status', 'status'), doc => {
    if (doc.exists()) {
      callback(doc.data() as GiftStatus)
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
  const statusRef = doc(db, 'users', userId, 'wishlist', itemId, 'gift_status', 'status')
  return setDoc(statusRef, {
    isTaken: true,
    takenBy,
    takenByName,
  })
}

export const unmarkItemAsTaken = async (userId: string, itemId: string) => {
  const statusRef = doc(db, 'users', userId, 'wishlist', itemId, 'gift_status', 'status')
  return deleteDoc(statusRef)
}
