import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { collection, doc, onSnapshot, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'
import { COLLECTIONS, QUERY_KEYS } from '../constants/firestore'
import type { Suggestion } from '../types'
import { useEffect } from 'react'

/**
 * Hook for fetching and subscribing to suggestions for a friend
 * These are gift suggestions made by other friends that the wishlist owner can't see
 */
export const useSuggestions = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    const suggestionsRef = collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.SUGGESTIONS)

    const q = query(suggestionsRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const suggestions: Suggestion[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Suggestion[]

      queryClient.setQueryData([QUERY_KEYS.SUGGESTIONS, userId], suggestions)
    })

    return () => unsubscribe()
  }, [userId, queryClient])

  return useQuery({
    queryKey: [QUERY_KEYS.SUGGESTIONS, userId],
    queryFn: () => Promise.resolve([] as Suggestion[]),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

/**
 * Hook for adding a suggestion for a friend
 */
export const useAddSuggestion = (friendId: string | undefined) => {
  return useMutation({
    mutationFn: async (suggestion: Omit<Suggestion, 'id' | 'createdAt'>) => {
      if (!friendId) throw new Error('Friend ID is required')

      const suggestionsRef = collection(db, COLLECTIONS.USERS, friendId, COLLECTIONS.SUGGESTIONS)

      // Filter out undefined values - Firebase doesn't accept them
      const cleanSuggestion: Record<string, unknown> = {
        title: suggestion.title,
        suggestedBy: suggestion.suggestedBy,
        suggestedByName: suggestion.suggestedByName,
        createdAt: Date.now(),
      }
      if (suggestion.description) cleanSuggestion.description = suggestion.description
      if (suggestion.url) cleanSuggestion.url = suggestion.url
      if (suggestion.price) cleanSuggestion.price = suggestion.price

      const docRef = await addDoc(suggestionsRef, cleanSuggestion)

      return {
        id: docRef.id,
        ...cleanSuggestion,
      } as Suggestion
    },
    // Note: No onSuccess needed - the real-time subscription in useSuggestions
    // will automatically update the cache when Firestore receives the new doc
  })
}

/**
 * Hook for deleting a suggestion (only the person who made it can delete it)
 */
export const useDeleteSuggestion = (friendId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (suggestionId: string) => {
      if (!friendId) throw new Error('Friend ID is required')

      const suggestionRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
        COLLECTIONS.SUGGESTIONS,
        suggestionId
      )

      await deleteDoc(suggestionRef)
    },
    onMutate: async suggestionId => {
      const queryKey = [QUERY_KEYS.SUGGESTIONS, friendId]
      await queryClient.cancelQueries({ queryKey })

      const previousSuggestions = queryClient.getQueryData<Suggestion[]>(queryKey)

      // Optimistically remove the suggestion
      queryClient.setQueryData<Suggestion[]>(queryKey, old => {
        if (!old) return []
        return old.filter(s => s.id !== suggestionId)
      })

      return { previousSuggestions, queryKey }
    },
    onError: (_err, _suggestionId, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousSuggestions)
      }
    },
  })
}
