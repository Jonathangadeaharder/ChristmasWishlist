/**
 * Firestore Friends Repository
 *
 * Implements the IFriendsRepository interface using Firebase Firestore.
 */
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore'
import { db } from '../../services/firebase'
import { COLLECTIONS } from '../../constants/firestore'
import type { UserProfile } from '../../types'
import type { IFriendsRepository, Unsubscribe } from '../types'

export const friendsRepository: IFriendsRepository = {
  subscribeToFriends(userId: string, callback: (friends: UserProfile[]) => void): Unsubscribe {
    return onSnapshot(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.FRIENDS), snapshot => {
      const friends = snapshot.docs.map(doc => doc.data() as UserProfile)
      callback(friends)
    })
  },

  async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return []

    // Search by exact email OR by displayName prefix (case-insensitive)
    // Only run email query if term contains @ to avoid validation errors
    const queries = []

    if (term.includes('@')) {
      queries.push(
        query(collection(db, COLLECTIONS.USERS), where('email', '==', searchTerm.trim()))
      )
    }

    queries.push(
      query(
        collection(db, COLLECTIONS.USERS),
        where('displayNameLower', '>=', term),
        where('displayNameLower', '<=', term + '\uf8ff')
      )
    )

    const snapshots = await Promise.all(queries.map(q => getDocs(q)))

    // Combine results and remove duplicates
    const resultsMap = new Map<string, UserProfile>()

    snapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        const data = doc.data() as UserProfile
        resultsMap.set(data.uid, data)
      })
    })

    return Array.from(resultsMap.values())
  },

  async addFriend(userId: string, friendId: string): Promise<UserProfile> {
    // First check if already a friend
    const isAlreadyFriend = await this.isFriend(userId, friendId)
    if (isAlreadyFriend) {
      throw new Error('User is already your friend')
    }

    // Fetch the friend's profile
    const friendProfile = await this.getUserProfile(friendId)
    if (!friendProfile) {
      throw new Error('User not found')
    }

    // Add to friends collection
    await setDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.FRIENDS, friendId), {
      uid: friendProfile.uid,
      email: friendProfile.email,
      displayName: friendProfile.displayName || '',
    })

    return friendProfile
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))
    if (!userDoc.exists()) {
      return null
    }
    return userDoc.data() as UserProfile
  },

  async isFriend(userId: string, friendId: string): Promise<boolean> {
    const friendDoc = await getDoc(
      doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.FRIENDS, friendId)
    )
    return friendDoc.exists()
  },
}
