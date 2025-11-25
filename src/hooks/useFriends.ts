import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { friendsRepository } from '../repositories'
import { QUERY_KEYS } from '../constants/firestore'
import type { UserProfile } from '../types'
import { useEffect } from 'react'

/**
 * Friend error codes for handling specific error cases
 */
export type FriendErrorCode = 'ALREADY_FRIEND' | 'NOT_FOUND' | 'SELF_ADD' | 'UNKNOWN'

/**
 * Extended Error interface for friend-related errors
 */
export interface FriendError extends Error {
  code: FriendErrorCode
}

/**
 * Create a FriendError with a specific error code
 */
export const createFriendError = (message: string, code: FriendErrorCode): FriendError => {
  const error = new Error(message) as FriendError
  error.name = 'FriendError'
  error.code = code
  return error
}

/**
 * Type guard to check if an error is a FriendError
 */
export const isFriendError = (error: unknown): error is FriendError => {
  return error instanceof Error && 'code' in error && error.name === 'FriendError'
}

/**
 * Hook for fetching and subscribing to user's friends list
 */
export const useFriends = (userId: string | undefined) => {
  const queryClient = useQueryClient()

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return

    const unsubscribe = friendsRepository.subscribeToFriends(userId, friends => {
      queryClient.setQueryData([QUERY_KEYS.FRIENDS, userId], friends)
    })

    return () => unsubscribe()
  }, [userId, queryClient])

  const queryKey = [QUERY_KEYS.FRIENDS, userId]

  return useQuery({
    queryKey,
    queryFn: () => Promise.resolve([] as UserProfile[]),
    enabled: !!userId,
    staleTime: Infinity,
  })
}

/**
 * Hook for searching users by email or display name
 */
export const useSearchUsers = () => {
  return useMutation({
    mutationFn: async (searchTerm: string): Promise<UserProfile[]> => {
      return friendsRepository.searchUsers(searchTerm)
    },
  })
}

/**
 * Hook for adding a friend with optimistic updates and duplicate prevention
 */
export const useAddFriend = (currentUserId: string | undefined) => {
  const queryClient = useQueryClient()
  const queryKey = [QUERY_KEYS.FRIENDS, currentUserId]

  return useMutation({
    mutationFn: async (friendId: string) => {
      if (!currentUserId) {
        throw createFriendError('User ID is required', 'UNKNOWN')
      }

      // Prevent adding yourself as a friend
      if (friendId === currentUserId) {
        throw createFriendError('You cannot add yourself as a friend', 'SELF_ADD')
      }

      // Check if already a friend
      const isAlreadyFriend = await friendsRepository.isFriend(currentUserId, friendId)
      if (isAlreadyFriend) {
        throw createFriendError('This user is already your friend', 'ALREADY_FRIEND')
      }

      // Add the friend using the repository
      return friendsRepository.addFriend(currentUserId, friendId)
    },
    onMutate: async friendId => {
      await queryClient.cancelQueries({ queryKey })
      const previousFriends = queryClient.getQueryData<UserProfile[]>(queryKey)

      // We don't have full friend data yet, so we create a placeholder
      // The real data will come from Firestore subscription
      const tempFriend: UserProfile = {
        uid: friendId,
        email: 'Loading...',
        displayName: '',
      }

      queryClient.setQueryData<UserProfile[]>(queryKey, old => [...(old || []), tempFriend])

      return { previousFriends }
    },
    onError: (_err, _friendId, context) => {
      if (context?.previousFriends) {
        queryClient.setQueryData(queryKey, context.previousFriends)
      }
    },
  })
}

/**
 * Hook for fetching a single user profile
 */
export const useUserProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.USER_PROFILE, userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required')
      const profile = await friendsRepository.getUserProfile(userId)
      if (!profile) throw new Error('User not found')
      return profile
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
