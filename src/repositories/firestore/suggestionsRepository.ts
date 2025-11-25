/**
 * Firestore Suggestions Repository
 *
 * Implements the ISuggestionsRepository interface using Firebase Firestore.
 * Suggestions are stored under each user's profile but only visible to friends.
 */
import { collection, doc, onSnapshot, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { COLLECTIONS } from '../../constants/firestore'
import type { Suggestion } from '../../types'
import type { ISuggestionsRepository, Unsubscribe } from '../types'

export const suggestionsRepository: ISuggestionsRepository = {
  subscribeToSuggestions(
    userId: string,
    callback: (suggestions: Suggestion[]) => void
  ): Unsubscribe {
    const suggestionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.SUGGESTIONS)

    const q = query(suggestionsRef, orderBy('createdAt', 'desc'))

    return onSnapshot(q, snapshot => {
      const suggestions: Suggestion[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Suggestion[]
      callback(suggestions)
    })
  },

  async addSuggestion(
    userId: string,
    suggestion: Omit<Suggestion, 'id' | 'createdAt'>
  ): Promise<Suggestion> {
    const suggestionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.SUGGESTIONS)

    const newSuggestion = {
      ...suggestion,
      createdAt: Date.now(),
    }

    const docRef = await addDoc(suggestionsRef, newSuggestion)

    return {
      id: docRef.id,
      ...newSuggestion,
    }
  },

  async deleteSuggestion(userId: string, suggestionId: string): Promise<void> {
    const suggestionRef = doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.SUGGESTIONS, suggestionId)

    await deleteDoc(suggestionRef)
  },
}
