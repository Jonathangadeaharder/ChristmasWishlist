import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { db } from '../services/firebase'
import { COLLECTIONS, DOCUMENTS, QUERY_KEYS } from '../constants/firestore'
import type { GiftStatus } from '../types'
import { useEffect } from 'react'

// Type for parent collection (wishlist or suggestions)
export type ParentCollection = 'wishlist' | 'suggestions'

/**
 * Hook for fetching and subscribing to gift status for a specific item
 * This is used on the friend's wishlist page to show if someone is getting an item
 * @param parentCollection - 'wishlist' or 'suggestions' to specify the parent collection
 */
export const useGiftStatus = (
  userId: string | undefined,
  itemId: string | undefined,
  parentCollection: ParentCollection = 'wishlist'
) => {
  const queryClient = useQueryClient()
  const collectionName =
    parentCollection === 'wishlist' ? COLLECTIONS.WISHLIST : COLLECTIONS.SUGGESTIONS

  useEffect(() => {
    if (!userId || !itemId) return

    const statusRef = doc(
      db,
      COLLECTIONS.USERS,
      userId,
      collectionName,
      itemId,
      COLLECTIONS.GIFT_STATUS,
      DOCUMENTS.STATUS
    )

    const unsubscribe = onSnapshot(statusRef, docSnapshot => {
      const queryKey = [QUERY_KEYS.GIFT_STATUS, parentCollection, userId, itemId]
      if (docSnapshot.exists()) {
        queryClient.setQueryData(queryKey, docSnapshot.data() as GiftStatus)
      } else {
        queryClient.setQueryData(queryKey, null)
      }
    })

    return () => unsubscribe()
  }, [userId, itemId, queryClient, collectionName])

  const queryKey = [QUERY_KEYS.GIFT_STATUS, parentCollection, userId, itemId]

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
export const useMarkItemAsTaken = (
  friendId: string | undefined,
  parentCollection: ParentCollection = 'wishlist'
) => {
  const queryClient = useQueryClient()
  const collectionName =
    parentCollection === 'wishlist' ? COLLECTIONS.WISHLIST : COLLECTIONS.SUGGESTIONS

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
        collectionName,
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
      const queryKey = [QUERY_KEYS.GIFT_STATUS, parentCollection, friendId, itemId]
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
export const useUnmarkItemAsTaken = (
  friendId: string | undefined,
  parentCollection: ParentCollection = 'wishlist'
) => {
  const queryClient = useQueryClient()
  const collectionName =
    parentCollection === 'wishlist' ? COLLECTIONS.WISHLIST : COLLECTIONS.SUGGESTIONS

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!friendId) throw new Error('Friend ID is required')

      const statusRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
        collectionName,
        itemId,
        COLLECTIONS.GIFT_STATUS,
        DOCUMENTS.STATUS
      )

      await deleteDoc(statusRef)
    },
    onMutate: async itemId => {
      const queryKey = [QUERY_KEYS.GIFT_STATUS, parentCollection, friendId, itemId]
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

/**
 * Hook for toggling split request on a gift (open/close looking for co-gifters)
 */
export const useToggleSplitRequest = (
  friendId: string | undefined,
  parentCollection: ParentCollection = 'wishlist'
) => {
  const queryClient = useQueryClient()
  const collectionName =
    parentCollection === 'wishlist' ? COLLECTIONS.WISHLIST : COLLECTIONS.SUGGESTIONS

  return useMutation({
    mutationFn: async ({ itemId, open }: { itemId: string; open: boolean }) => {
      if (!friendId) throw new Error('Friend ID is required')

      const statusRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
        collectionName,
        itemId,
        COLLECTIONS.GIFT_STATUS,
        DOCUMENTS.STATUS
      )

      await updateDoc(statusRef, {
        splitRequestOpen: open,
        ...(open ? { isSplit: true } : { isSplit: deleteField() }),
      })
    },
    onMutate: async ({ itemId, open }) => {
      const queryKey = [QUERY_KEYS.GIFT_STATUS, parentCollection, friendId, itemId]
      await queryClient.cancelQueries({ queryKey })

      const previousStatus = queryClient.getQueryData<GiftStatus | null>(queryKey)

      if (previousStatus) {
        queryClient.setQueryData<GiftStatus>(queryKey, {
          ...previousStatus,
          splitRequestOpen: open,
          ...(open ? { isSplit: true } : {}),
        })
      }

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
 * Hook for requesting to join a gift split
 */
export const useRequestToJoinSplit = (
  friendId: string | undefined,
  parentCollection: ParentCollection = 'wishlist'
) => {
  const queryClient = useQueryClient()
  const collectionName =
    parentCollection === 'wishlist' ? COLLECTIONS.WISHLIST : COLLECTIONS.SUGGESTIONS

  return useMutation({
    mutationFn: async ({
      itemId,
      contributorId,
      contributorName,
    }: {
      itemId: string
      contributorId: string
      contributorName: string
    }) => {
      if (!friendId) throw new Error('Friend ID is required')

      const statusRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
        collectionName,
        itemId,
        COLLECTIONS.GIFT_STATUS,
        DOCUMENTS.STATUS
      )

      const docSnap = await getDoc(statusRef)
      if (!docSnap.exists()) throw new Error('Gift status not found')

      const newContributor = {
        uid: contributorId,
        name: contributorName,
        status: 'pending' as const,
        joinedAt: Date.now(),
      }

      await updateDoc(statusRef, {
        contributors: arrayUnion(newContributor),
      })
    },
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GIFT_STATUS, parentCollection, friendId, itemId],
      })
    },
  })
}

/**
 * Hook for confirming a pending contributor
 */
export const useConfirmContributor = (
  friendId: string | undefined,
  parentCollection: ParentCollection = 'wishlist'
) => {
  const queryClient = useQueryClient()
  const collectionName =
    parentCollection === 'wishlist' ? COLLECTIONS.WISHLIST : COLLECTIONS.SUGGESTIONS

  return useMutation({
    mutationFn: async ({ itemId, contributorId }: { itemId: string; contributorId: string }) => {
      if (!friendId) throw new Error('Friend ID is required')

      const statusRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
        collectionName,
        itemId,
        COLLECTIONS.GIFT_STATUS,
        DOCUMENTS.STATUS
      )

      const docSnap = await getDoc(statusRef)
      if (!docSnap.exists()) throw new Error('Gift status not found')

      const data = docSnap.data() as GiftStatus
      const contributors = data.contributors || []
      const updatedContributors = contributors.map(c =>
        c.uid === contributorId ? { ...c, status: 'confirmed' as const } : c
      )

      await updateDoc(statusRef, { contributors: updatedContributors })
    },
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GIFT_STATUS, parentCollection, friendId, itemId],
      })
    },
  })
}

/**
 * Hook for removing a contributor or leaving a split
 */
export const useRemoveContributor = (
  friendId: string | undefined,
  parentCollection: ParentCollection = 'wishlist'
) => {
  const queryClient = useQueryClient()
  const collectionName =
    parentCollection === 'wishlist' ? COLLECTIONS.WISHLIST : COLLECTIONS.SUGGESTIONS

  return useMutation({
    mutationFn: async ({ itemId, contributorId }: { itemId: string; contributorId: string }) => {
      if (!friendId) throw new Error('Friend ID is required')

      const statusRef = doc(
        db,
        COLLECTIONS.USERS,
        friendId,
        collectionName,
        itemId,
        COLLECTIONS.GIFT_STATUS,
        DOCUMENTS.STATUS
      )

      const docSnap = await getDoc(statusRef)
      if (!docSnap.exists()) throw new Error('Gift status not found')

      const data = docSnap.data() as GiftStatus
      const contributors = data.contributors || []
      const contributorToRemove = contributors.find(c => c.uid === contributorId)

      if (contributorToRemove) {
        await updateDoc(statusRef, {
          contributors: arrayRemove(contributorToRemove),
        })
      }
    },
    onSuccess: (_data, { itemId }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GIFT_STATUS, parentCollection, friendId, itemId],
      })
    },
  })
}
