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
import type { UserProfile } from '../types'

export const searchUsers = async (email: string): Promise<UserProfile[]> => {
  const q = query(collection(db, 'users'), where('email', '==', email))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as UserProfile)
}

export const addFriend = async (currentUserId: string, friendId: string) => {
  // Add friend to current user's friend list
  // We need to fetch the friend's profile first to store basic info
  const friendDoc = await getDoc(doc(db, 'users', friendId))
  if (!friendDoc.exists()) throw new Error('User not found')

  const friendData = friendDoc.data() as UserProfile

  await setDoc(doc(db, 'users', currentUserId, 'friends', friendId), {
    uid: friendData.uid,
    email: friendData.email,
  })
}

export const getFriends = (userId: string, callback: (friends: UserProfile[]) => void) => {
  return onSnapshot(collection(db, 'users', userId, 'friends'), snapshot => {
    const friends = snapshot.docs.map(doc => doc.data() as UserProfile)
    callback(friends)
  })
}
