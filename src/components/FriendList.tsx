import React, { useState } from 'react'
import type { UserProfile } from '../types'
import { useFriends, useSearchUsers, useAddFriend, isFriendError } from '../hooks'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { UserPlus, Users, Search, ChevronRight, Loader2 } from 'lucide-react'
import { useLanguage } from '../i18n'

type MessageType = 'added' | 'notFound' | 'error' | 'alreadyFriend' | 'selfAdd' | ''

export const FriendList: React.FC = () => {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [message, setMessage] = useState<MessageType>('')

  // React Query hooks
  const { data: friends = [] } = useFriends(currentUser?.uid)
  const searchMutation = useSearchUsers()
  const addFriendMutation = useAddFriend(currentUser?.uid)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setMessage('')
    try {
      const results = await searchMutation.mutateAsync(searchTerm)
      // Filter out self and existing friends
      const filtered = results.filter(
        u => u.uid !== currentUser?.uid && !friends.some(f => f.uid === u.uid)
      )
      setSearchResults(filtered)
      if (filtered.length === 0) setMessage('notFound')
    } catch {
      setMessage('error')
    }
  }

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser) return
    try {
      await addFriendMutation.mutateAsync(friendId)
      setSearchResults(prev => prev.filter(u => u.uid !== friendId))
      setMessage('added')
      setSearchTerm('')
    } catch (err) {
      // Handle specific friend errors
      if (isFriendError(err)) {
        switch (err.code) {
          case 'ALREADY_FRIEND':
            setMessage('alreadyFriend')
            break
          case 'SELF_ADD':
            setMessage('selfAdd')
            break
          default:
            setMessage('error')
        }
      } else {
        setMessage('error')
      }
    }
  }

  const getMessageText = (msg: MessageType): string => {
    switch (msg) {
      case 'added':
        return t('friendAdded')
      case 'alreadyFriend':
        return t('alreadyFriend') || 'Already a friend'
      case 'selfAdd':
        return t('cannotAddSelf') || 'Cannot add yourself'
      case 'error':
        return 'Error'
      case 'notFound':
        return 'No users found'
      default:
        return ''
    }
  }

  const getMessageColor = (msg: MessageType): string => {
    switch (msg) {
      case 'added':
        return 'text-green-600'
      case 'error':
      case 'alreadyFriend':
      case 'selfAdd':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const isSearching = searchMutation.isPending

  return (
    <div className="card-festive h-full p-5" data-testid="friend-list">
      <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-800">
        <Users size={22} className="text-green-600" />
        {t('friends')}
        {friends.length > 0 && (
          <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            {friends.length}
          </span>
        )}
      </h3>

      <form onSubmit={handleSearch} className="mb-5" data-testid="friend-search-form">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('findByEmail')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-festive input-with-icon text-sm"
              data-testid="friend-search-input"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="btn-success flex items-center justify-center px-3 py-2"
            data-testid="friend-search-button"
          >
            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          </button>
        </div>
        {message && (
          <p
            className={`mt-2 text-sm ${getMessageColor(message)}`}
            data-testid="friend-search-message"
          >
            {getMessageText(message)}
          </p>
        )}
      </form>

      {searchResults.length > 0 && (
        <div className="mb-5 border-b border-gray-100 pb-4" data-testid="friend-search-results">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            {t('searchResults')}
          </h4>
          <ul className="space-y-2">
            {searchResults.map(user => (
              <li
                key={user.uid}
                className="flex items-center justify-between rounded-lg bg-blue-50 p-2"
                data-testid={`search-result-${user.uid}`}
              >
                <div className="min-w-0 flex-1">
                  {user.displayName && (
                    <span className="block truncate text-sm font-medium text-gray-800">
                      {user.displayName}
                    </span>
                  )}
                  <span className="block truncate text-xs text-gray-500">{user.email}</span>
                </div>
                <button
                  onClick={() => handleAddFriend(user.uid)}
                  className="ml-2 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  data-testid="add-friend-button"
                >
                  <UserPlus size={14} />
                  {t('add')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2" data-testid="friends-list">
        {friends.length === 0 ? (
          <div className="py-8 text-center" data-testid="no-friends-message">
            <div className="mb-3 text-4xl">👥</div>
            <p className="text-sm text-gray-500">{t('noFriendsYet')}</p>
            <p className="mt-1 text-xs text-gray-400">{t('searchByEmail')}</p>
          </div>
        ) : (
          <>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              {t('viewWishlists')}
            </h4>
            {friends.map(friend => (
              <Link
                key={friend.uid}
                to={`/friend/${friend.uid}`}
                className="group flex items-center justify-between rounded-xl border border-transparent bg-gray-50 p-3 transition-all hover:border-green-200 hover:bg-green-50"
                data-testid={`friend-${friend.uid}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-sm font-semibold text-white">
                    {(friend.displayName || friend.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    {friend.displayName && (
                      <span className="block truncate text-sm font-medium text-gray-700">
                        {friend.displayName}
                      </span>
                    )}
                    <span
                      className={`block truncate text-gray-500 ${friend.displayName ? 'text-xs' : 'text-sm font-medium'}`}
                    >
                      {friend.email}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-green-600"
                />
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
