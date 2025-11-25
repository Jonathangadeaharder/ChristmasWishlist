/**
 * Firestore Gift Status Repository
 *
 * Implements the IGiftStatusRepository interface using Firebase Firestore.
 */
import {
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
} from 'firebase/firestore'
import { db } from '../../services/firebase'
import { COLLECTIONS, DOCUMENTS } from '../../constants/firestore'
import type { GiftStatus, GiftContributor } from '../../types'
import type { IGiftStatusRepository, Unsubscribe } from '../types'

const getStatusRef = (userId: string, itemId: string) =>
  doc(
    db,
    COLLECTIONS.USERS,
    userId,
    COLLECTIONS.WISHLIST,
    itemId,
    COLLECTIONS.GIFT_STATUS,
    DOCUMENTS.STATUS
  )

export const giftStatusRepository: IGiftStatusRepository = {
  subscribeToStatus(
    userId: string,
    itemId: string,
    callback: (status: GiftStatus | null) => void
  ): Unsubscribe {
    const statusRef = getStatusRef(userId, itemId)

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
    const statusRef = getStatusRef(userId, itemId)

    await setDoc(statusRef, {
      isTaken: true,
      takenBy,
      takenByName,
      isSplit: false,
      splitRequestOpen: false,
      contributors: [
        {
          uid: takenBy,
          name: takenByName,
          status: 'confirmed',
          joinedAt: Date.now(),
        },
      ],
    })
  },

  async unmark(userId: string, itemId: string): Promise<void> {
    const statusRef = getStatusRef(userId, itemId)
    await deleteDoc(statusRef)
  },

  async toggleSplitRequest(userId: string, itemId: string, open: boolean): Promise<void> {
    const statusRef = getStatusRef(userId, itemId)
    await updateDoc(statusRef, {
      splitRequestOpen: open,
      ...(open ? { isSplit: true } : { isSplit: deleteField() }),
    })
  },

  async requestToJoinSplit(
    userId: string,
    itemId: string,
    contributorId: string,
    contributorName: string
  ): Promise<void> {
    const statusRef = getStatusRef(userId, itemId)
    const newContributor: GiftContributor = {
      uid: contributorId,
      name: contributorName,
      status: 'pending',
      joinedAt: Date.now(),
    }

    await updateDoc(statusRef, {
      contributors: arrayUnion(newContributor),
    })
  },

  async confirmContributor(userId: string, itemId: string, contributorId: string): Promise<void> {
    const statusRef = getStatusRef(userId, itemId)
    const docSnap = await getDoc(statusRef)

    if (!docSnap.exists()) return

    const data = docSnap.data() as GiftStatus
    const contributors = data.contributors || []
    const updatedContributors = contributors.map(c =>
      c.uid === contributorId ? { ...c, status: 'confirmed' as const } : c
    )

    await updateDoc(statusRef, { contributors: updatedContributors })
  },

  async removeContributor(userId: string, itemId: string, contributorId: string): Promise<void> {
    const statusRef = getStatusRef(userId, itemId)
    const docSnap = await getDoc(statusRef)

    if (!docSnap.exists()) return

    const data = docSnap.data() as GiftStatus
    const contributors = data.contributors || []
    const contributorToRemove = contributors.find(c => c.uid === contributorId)

    if (contributorToRemove) {
      await updateDoc(statusRef, {
        contributors: arrayRemove(contributorToRemove),
      })
    }
  },
}
