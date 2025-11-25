/**
 * Friends Service
 *
 * @deprecated These functions are kept for backwards compatibility.
 * New code should use the React Query hooks from src/hooks/useFriends.ts instead.
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
import { db } from './firebase'
import { COLLECTIONS } from '../constants/firestore'
import type { UserProfile } from '../types'

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  const term = searchTerm.trim().toLowerCase()
  if (!term) return []

  // Search by exact email OR by displayName prefix (case-insensitive)
  const emailQuery = query(
    collection(db, COLLECTIONS.USERS),
    where('email', '==', searchTerm.trim())
  )
  const nameQuery = query(
    collection(db, COLLECTIONS.USERS),
    where('displayNameLower', '>=', term),
    where('displayNameLower', '<=', term + '\uf8ff')
  )

  const [emailSnapshot, nameSnapshot] = await Promise.all([getDocs(emailQuery), getDocs(nameQuery)])

  // Combine results and remove duplicates
  const resultsMap = new Map<string, UserProfile>()

  emailSnapshot.docs.forEach(doc => {
    const data = doc.data() as UserProfile
    resultsMap.set(data.uid, data)
  })

  nameSnapshot.docs.forEach(doc => {
    const data = doc.data() as UserProfile
    resultsMap.set(data.uid, data)
  })

  return Array.from(resultsMap.values())
}

export const addFriend = async (currentUserId: string, friendId: string) => {
  // Add friend to current user's friend list
  // We need to fetch the friend's profile first to store basic info
  const friendDoc = await getDoc(doc(db, COLLECTIONS.USERS, friendId))
  if (!friendDoc.exists()) throw new Error('User not found')

  const friendData = friendDoc.data() as UserProfile

  await setDoc(doc(db, COLLECTIONS.USERS, currentUserId, COLLECTIONS.FRIENDS, friendId), {
    uid: friendData.uid,
    email: friendData.email,
    displayName: friendData.displayName || '',
  })
}

export const getFriends = (userId: string, callback: (friends: UserProfile[]) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.FRIENDS), snapshot => {
    const friends = snapshot.docs.map(doc => doc.data() as UserProfile)
    callback(friends)
  })
}
