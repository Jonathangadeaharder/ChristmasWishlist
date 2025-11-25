import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../services/firebase'
import { COLLECTIONS, QUERY_KEYS } from '../constants/firestore'
import type { WishlistItem } from '../types'
import { useEffect } from 'react'

/**
 * Hook for fetching and subscribing to a user's wishlist
 * Uses React Query for caching with real-time Firestore subscription
 */
export const useWishlist = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return

    const q = query(
      collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WishlistItem[]
      // Update React Query cache directly from Firestore
      queryClient.setQueryData([QUERY_KEYS.WISHLIST, userId], items)
    })

    return () => unsubscribe()
  }, [userId, queryClient])

  const queryKey = [QUERY_KEYS.WISHLIST, userId]

  return useQuery({
    queryKey,
    queryFn: () => Promise.resolve([] as WishlistItem[]),
    enabled: !!userId,
    staleTime: Infinity, // Let Firestore handle updates
  })
}

/**
 * Hook for adding a wishlist item with optimistic updates
 */
export const useAddWishlistItem = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const queryKey = [QUERY_KEYS.WISHLIST, userId]

  return useMutation({
    mutationFn: async (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
      if (!userId) throw new Error('User ID is required')

      const docRef = await addDoc(collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST), {
        ...item,
        createdAt: Date.now(),
      })
      return { id: docRef.id, ...item, createdAt: Date.now() } as WishlistItem
    },
    onMutate: async newItem => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot current state
      const previousItems = queryClient.getQueryData<WishlistItem[]>(queryKey)

      // Optimistically update with temporary ID
      const tempItem: WishlistItem = {
        id: `temp-${Date.now()}`,
        ...newItem,
        createdAt: Date.now(),
      }

      queryClient.setQueryData<WishlistItem[]>(queryKey, old => [tempItem, ...(old || [])])

      return { previousItems }
    },
    onError: (_err, _newItem, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems)
      }
    },
    // No onSuccess needed - Firestore subscription will update the cache
  })
}

/**
 * Hook for deleting a wishlist item with optimistic updates
 */
export const useDeleteWishlistItem = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const queryKey = [QUERY_KEYS.WISHLIST, userId]

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!userId) throw new Error('User ID is required')
      await deleteDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST, itemId))
    },
    onMutate: async itemId => {
      await queryClient.cancelQueries({ queryKey })
      const previousItems = queryClient.getQueryData<WishlistItem[]>(queryKey)

      // Optimistically remove the item
      queryClient.setQueryData<WishlistItem[]>(
        queryKey,
        old => old?.filter(item => item.id !== itemId) || []
      )

      return { previousItems }
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems)
      }
    },
  })
}

/**
 * Hook for updating a wishlist item
 */
export const useUpdateWishlistItem = (userId: string | undefined) => {
  const queryClient = useQueryClient()
  const queryKey = [QUERY_KEYS.WISHLIST, userId]

  return useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: Partial<WishlistItem> }) => {
      if (!userId) throw new Error('User ID is required')
      await updateDoc(doc(db, COLLECTIONS.USERS, userId, COLLECTIONS.WISHLIST, itemId), data)
    },
    onMutate: async ({ itemId, data }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousItems = queryClient.getQueryData<WishlistItem[]>(queryKey)

      // Optimistically update the item
      queryClient.setQueryData<WishlistItem[]>(
        queryKey,
        old => old?.map(item => (item.id === itemId ? { ...item, ...data } : item)) || []
      )

      return { previousItems }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKey, context.previousItems)
      }
    },
  })
}
