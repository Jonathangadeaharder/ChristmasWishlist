import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { COLLECTIONS, DOCUMENTS, QUERY_KEYS } from '../constants/firestore'
import type { GiftStatus } from '../types'
import { useEffect } from 'react'

/**
 * Hook for fetching and subscribing to gift status for a specific item
 * This is used on the friend's wishlist page to show if someone is getting an item
 */
export const useGiftStatus = (userId: string | undefined, itemId: string | undefined) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId || !itemId) return

    const statusRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.WISHLIST,
      itemId,
      COLLECTIONS.GIFT_STATUS,
      DOCUMENTS.STATUS
    )

    const unsubscribe = onSnapshot(statusRef, docSnapshot => {
      const queryKey = [QUERY_KEYS.GIFT_STATUS, userId, itemId]
      if (docSnapshot.exists()) {
        queryClient.setQueryData(queryKey, docSnapshot.data() as GiftStatus)
      } else {
        queryClient.setQueryData(queryKey, null)
      }
    })

    return () => unsubscribe()
  }, [userId, itemId, queryClient])

  const queryKey = [QUERY_KEYS.GIFT_STATUS, userId, itemId]

  return useQuery({
    queryKey,
    queryFn: () => Promise.resolve(null as GiftStatus | null),
    enabled: !!userId && !!itemId,
    staleTime: Infinity,
  })
}

/**
 * Hook for marking an item as "I'll get this" with optimistic updates
 */
export const useMarkItemAsTaken = (friendId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      itemId,
      takenBy,
      takenByName,
    }: {
      itemId: string
      takenBy: string
      takenByName: string
    }) => {
      if (!friendId) throw new Error('Friend ID is required')

      const statusRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
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
    onMutate: async ({ itemId, takenBy, takenByName }) => {
      const queryKey = [QUERY_KEYS.GIFT_STATUS, friendId, itemId]
      await queryClient.cancelQueries({ queryKey })

      const previousStatus = queryClient.getQueryData<GiftStatus | null>(queryKey)

      // Optimistically set the status
      queryClient.setQueryData<GiftStatus>(queryKey, {
        isTaken: true,
        takenBy,
        takenByName,
      })

      return { previousStatus, queryKey }
    },
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousStatus)
      }
    },
  })
}

/**
 * Hook for unmarking an item (cancel "I'll get this")
 */
export const useUnmarkItemAsTaken = (friendId: string | undefined) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!friendId) throw new Error('Friend ID is required')

      const statusRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
        COLLECTIONS.WISHLIST,
        itemId,
        COLLECTIONS.GIFT_STATUS,
        DOCUMENTS.STATUS
      )

      await deleteDoc(statusRef)
    },
    onMutate: async itemId => {
      const queryKey = [QUERY_KEYS.GIFT_STATUS, friendId, itemId]
      await queryClient.cancelQueries({ queryKey })

      const previousStatus = queryClient.getQueryData<GiftStatus | null>(queryKey)

      // Optimistically clear the status
      queryClient.setQueryData(queryKey, null)

      return { previousStatus, queryKey }
    },
    onError: (_err, _itemId, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousStatus)
      }
    },
  })
}
