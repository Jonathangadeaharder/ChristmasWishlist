import React, { useState, useEffect } from 'react'
import type { UserProfile } from '../types'
import { searchUsers, addFriend, getFriends } from '../services/friends'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { UserPlus, Users, Search, ChevronRight, Loader2 } from 'lucide-react'

export const FriendList: React.FC = () => {
  const { currentUser } = useAuth()
  const [friends, setFriends] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getFriends(currentUser.uid, setFriends)
      return () => unsubscribe()
    }
  }, [currentUser])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setLoading(true)
    setMessage('')
    try {
      const results = await searchUsers(searchTerm)
      // Filter out self and existing friends
      const filtered = results.filter(
        u => u.uid !== currentUser?.uid && !friends.some(f => f.uid === u.uid)
      )
      setSearchResults(filtered)
      if (filtered.length === 0) setMessage('No new users found.')
    } catch {
      setMessage('Error searching users.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser) return
    try {
      await addFriend(currentUser.uid, friendId)
      setSearchResults(prev => prev.filter(u => u.uid !== friendId))
      setMessage('Friend added!')
      setSearchTerm('')
    } catch {
      setMessage('Error adding friend.')
    }
  }

  return (
    <div className="card-festive h-full p-5" data-testid="friend-list">
      <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-800">
        <Users size={22} className="text-green-600" />
        Friends
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
              type="email"
              placeholder="Find by email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-festive input-with-icon text-sm"
              data-testid="friend-search-input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-success flex items-center justify-center px-3 py-2"
            data-testid="friend-search-button"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          </button>
        </div>
        {message && (
          <p
            className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-500' : message.includes('added') ? 'text-green-600' : 'text-gray-500'}`}
            data-testid="friend-search-message"
          >
            {message}
          </p>
        )}
      </form>

      {searchResults.length > 0 && (
        <div className="mb-5 border-b border-gray-100 pb-4" data-testid="friend-search-results">
          <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
            Search Results
          </h4>
          <ul className="space-y-2">
            {searchResults.map(user => (
              <li
                key={user.uid}
                className="flex items-center justify-between rounded-lg bg-blue-50 p-2"
                data-testid={`search-result-${user.uid}`}
              >
                <span className="truncate text-sm text-gray-700">{user.email}</span>
                <button
                  onClick={() => handleAddFriend(user.uid)}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  data-testid="add-friend-button"
                >
                  <UserPlus size={14} />
                  Add
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
            <p className="text-sm text-gray-500">No friends yet</p>
            <p className="mt-1 text-xs text-gray-400">Search by email to add friends</p>
          </div>
        ) : (
          <>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              View Wishlists
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
                    {friend.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate text-sm font-medium text-gray-700">{friend.email}</span>
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
