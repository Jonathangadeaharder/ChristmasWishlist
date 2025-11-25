import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useWishlist,
  useUserProfile,
  useGiftStatus,
  useMarkItemAsTaken,
  useUnmarkItemAsTaken,
} from '../hooks'
import type { WishlistItem } from '../types'
import { ArrowLeft, Gift, Check, ExternalLink, Loader2 } from 'lucide-react'
import { useLanguage } from '../i18n'

interface FriendWishlistItemProps {
  item: WishlistItem
  friendId: string
  currentUserId: string
  currentUserEmail: string
}

const FriendWishlistItem: React.FC<FriendWishlistItemProps> = ({
  item,
  friendId,
  currentUserId,
  currentUserEmail,
}) => {
  const { t } = useLanguage()

  // React Query hooks with real-time subscriptions
  const { data: giftStatus } = useGiftStatus(friendId, item.id)
  const markMutation = useMarkItemAsTaken(friendId)
  const unmarkMutation = useUnmarkItemAsTaken(friendId)

  const loading = markMutation.isPending || unmarkMutation.isPending

  const handleMarkAsTaken = async () => {
    await markMutation.mutateAsync({
      itemId: item.id,
      takenBy: currentUserId,
      takenByName: currentUserEmail,
    })
  }

  const handleUnmark = async () => {
    await unmarkMutation.mutateAsync(item.id)
  }

  const isTakenByMe = giftStatus?.takenBy === currentUserId
  const isTakenByOther = giftStatus?.isTaken && !isTakenByMe

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }

  return (
    <div
      className={`rounded border bg-white p-4 shadow ${isTakenByOther ? 'border-gray-300 opacity-60' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <span className={`rounded-full px-2 py-1 text-xs ${priorityColors[item.priority]}`}>
              {item.priority}
            </span>
          </div>
          {item.description && <p className="mb-2 text-sm text-gray-600">{item.description}</p>}
          <div className="flex gap-4 text-sm text-gray-500">
            {item.price && <span>Price: {item.price}</span>}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                Link <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="ml-4">
          {giftStatus?.isTaken ? (
            <div className="text-center">
              {isTakenByMe ? (
                <>
                  <span className="mb-1 flex items-center gap-1 text-sm text-green-600">
                    <Check size={16} /> {t('youreGettingThis')}
                  </span>
                  <button
                    onClick={handleUnmark}
                    disabled={loading}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    {t('cancel')}
                  </button>
                </>
              ) : (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Gift size={16} /> {t('alreadyTaken')}
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={handleMarkAsTaken}
              disabled={loading}
              className="flex items-center gap-1 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Gift size={16} /> {t('illGetThis')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const FriendWishlist: React.FC = () => {
  const { t } = useLanguage()
  const { friendId } = useParams<{ friendId: string }>()
  const { currentUser } = useAuth()

  // React Query hooks
  const { data: items = [], isLoading: isLoadingItems } = useWishlist(friendId)
  const { data: friendProfile } = useUserProfile(friendId)

  if (!friendId || !currentUser) {
    return <div>Invalid request</div>
  }

  const friendEmail = friendProfile?.email || ''
  const isLoading = isLoadingItems

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-red-600 p-4 text-white shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-xl font-bold">🎄 {t('appName')}</h1>
          <Link
            to="/"
            className="flex items-center gap-1 rounded bg-white px-3 py-1 text-sm font-medium text-red-600 transition-colors hover:bg-gray-100"
          >
            <ArrowLeft size={16} /> {t('back')}
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {friendEmail ? `${friendEmail}${t('wishlistOf')}` : t('myWishlist')}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{t('selectItems')}</p>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
            <p className="mt-2 text-gray-500">{t('loading')}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded bg-white py-10 text-center text-gray-500 shadow">
            <p>{t('emptyWishlist')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map(item => (
              <FriendWishlistItem
                key={item.id}
                item={item}
                friendId={friendId}
                currentUserId={currentUser.uid}
                currentUserEmail={currentUser.email || ''}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default FriendWishlist
