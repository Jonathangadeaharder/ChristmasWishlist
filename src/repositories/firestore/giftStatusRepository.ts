/**
 * Firestore Gift Status Repository
 *
 * Implements the IGiftStatusRepository interface using Firebase Firestore.
 */
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { COLLECTIONS, DOCUMENTS } from '../../constants/firestore'
import type { GiftStatus } from '../../types'
import type { IGiftStatusRepository, Unsubscribe } from '../types'

export const giftStatusRepository: IGiftStatusRepository = {
  subscribeToStatus(
    userId: string,
    itemId: string,
    callback: (status: GiftStatus | null) => void
  ): Unsubscribe {
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
  },

  async markAsTaken(
    userId: string,
    itemId: string,
    takenBy: string,
    takenByName: string
  ): Promise<void> {
    const statusRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.WISHLIST,
      itemId,
      COLLECTIONS.GIFT_STATUS,
      DOCUMENTS.STATUS
    )

    await setDoc(statusRef, {
      isTaken: true,
      takenBy,
      takenByName,
    })
  },

  async unmark(userId: string, itemId: string): Promise<void> {
    const statusRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.WISHLIST,
      itemId,
      COLLECTIONS.GIFT_STATUS,
      DOCUMENTS.STATUS
    )

    await deleteDoc(statusRef)
  },
}
