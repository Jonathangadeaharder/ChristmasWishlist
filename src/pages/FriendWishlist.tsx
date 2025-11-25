import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  useWishlist,
  useUserProfile,
  useGiftStatus,
  useMarkItemAsTaken,
  useUnmarkItemAsTaken,
  useToggleSplitRequest,
  useRequestToJoinSplit,
  useConfirmContributor,
  useRemoveContributor,
} from '../hooks'
import type { WishlistItem } from '../types'
import {
  ArrowLeft,
  Gift,
  Check,
  ExternalLink,
  Loader2,
  Users,
  UserPlus,
  X,
  Clock,
} from 'lucide-react'
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
  const [showSplitOptions, setShowSplitOptions] = useState(false)

  // React Query hooks with real-time subscriptions
  const { data: giftStatus } = useGiftStatus(friendId, item.id)
  const markMutation = useMarkItemAsTaken(friendId)
  const unmarkMutation = useUnmarkItemAsTaken(friendId)
  const toggleSplitMutation = useToggleSplitRequest(friendId)
  const joinSplitMutation = useRequestToJoinSplit(friendId)
  const confirmMutation = useConfirmContributor(friendId)
  const removeMutation = useRemoveContributor(friendId)

  const loading =
    markMutation.isPending ||
    unmarkMutation.isPending ||
    toggleSplitMutation.isPending ||
    joinSplitMutation.isPending ||
    confirmMutation.isPending ||
    removeMutation.isPending

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

  const handleToggleSplit = async (open: boolean) => {
    await toggleSplitMutation.mutateAsync({ itemId: item.id, open })
    setShowSplitOptions(false)
  }

  const handleJoinSplit = async () => {
    await joinSplitMutation.mutateAsync({
      itemId: item.id,
      contributorId: currentUserId,
      contributorName: currentUserEmail,
    })
  }

  const handleConfirmContributor = async (contributorId: string) => {
    await confirmMutation.mutateAsync({ itemId: item.id, contributorId })
  }

  const handleRemoveContributor = async (contributorId: string) => {
    await removeMutation.mutateAsync({ itemId: item.id, contributorId })
  }

  const isTakenByMe = giftStatus?.takenBy === currentUserId
  const isTakenByOther = giftStatus?.isTaken && !isTakenByMe
  const contributors = giftStatus?.contributors || []
  const myContribution = contributors.find(c => c.uid === currentUserId)
  const isContributor = !!myContribution
  const isPendingContributor = myContribution?.status === 'pending'
  const pendingContributors = contributors.filter(
    c => c.status === 'pending' && c.uid !== giftStatus?.takenBy
  )
  const confirmedContributors = contributors.filter(c => c.status === 'confirmed')

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow ${isTakenByOther && !giftStatus?.splitRequestOpen ? 'border-gray-300 opacity-60' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h3 className="text-lg font-bold">{item.title}</h3>
            <span className={`rounded-full px-2 py-1 text-xs ${priorityColors[item.priority]}`}>
              {item.priority}
            </span>
            {giftStatus?.splitRequestOpen && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                <Users size={12} /> {t('lookingForSplit')}
              </span>
            )}
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

          {/* Contributors list */}
          {confirmedContributors.length > 1 && (
            <div className="mt-3 border-t pt-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-500">
                <Users size={14} /> {t('contributors')} ({confirmedContributors.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {confirmedContributors.map(c => (
                  <span
                    key={c.uid}
                    className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                  >
                    <Check size={10} /> {c.name}
                    {isTakenByMe && c.uid !== currentUserId && (
                      <button
                        onClick={() => handleRemoveContributor(c.uid)}
                        className="ml-1 text-red-500 hover:text-red-700"
                        title={t('removeContributor')}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pending contributors (only visible to primary gifter) */}
          {isTakenByMe && pendingContributors.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-orange-600">
                <Clock size={14} /> {t('pendingApproval')} ({pendingContributors.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingContributors.map(c => (
                  <div
                    key={c.uid}
                    className="flex items-center gap-2 rounded-full bg-orange-50 px-2 py-1 text-xs"
                  >
                    <span className="text-gray-700">{c.name}</span>
                    <button
                      onClick={() => handleConfirmContributor(c.uid)}
                      className="rounded bg-green-500 px-2 py-0.5 text-white hover:bg-green-600"
                    >
                      {t('confirmJoin')}
                    </button>
                    <button
                      onClick={() => handleRemoveContributor(c.uid)}
                      className="rounded bg-red-500 px-2 py-0.5 text-white hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col items-end gap-2">
          {giftStatus?.isTaken ? (
            <div className="text-center">
              {isTakenByMe ? (
                <div className="flex flex-col items-end gap-2">
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <Check size={16} /> {t('youreGettingThis')}
                  </span>

                  {/* Split options for the primary gifter */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSplitOptions(!showSplitOptions)}
                      className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200"
                    >
                      <Users size={14} /> {t('splitWith')}
                    </button>

                    {showSplitOptions && (
                      <div className="absolute top-full right-0 z-10 mt-1 rounded-lg border bg-white p-2 shadow-lg">
                        {giftStatus.splitRequestOpen ? (
                          <button
                            onClick={() => handleToggleSplit(false)}
                            disabled={loading}
                            className="flex w-full items-center gap-1 rounded px-3 py-2 text-xs whitespace-nowrap text-red-600 hover:bg-red-50"
                          >
                            <X size={14} /> {t('stopLookingForSplit')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleSplit(true)}
                            disabled={loading}
                            className="flex w-full items-center gap-1 rounded px-3 py-2 text-xs whitespace-nowrap text-blue-600 hover:bg-blue-50"
                          >
                            <UserPlus size={14} /> {t('lookingForSplit')}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleUnmark}
                    disabled={loading}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    {t('cancel')}
                  </button>
                </div>
              ) : isContributor ? (
                <div className="flex flex-col items-end gap-1">
                  {isPendingContributor ? (
                    <span className="flex items-center gap-1 text-sm text-orange-500">
                      <Clock size={16} /> {t('waitingForApproval')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Check size={16} /> {t('youJoined')}
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveContributor(currentUserId)}
                    disabled={loading}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    {t('leaveSplit')}
                  </button>
                </div>
              ) : giftStatus.splitRequestOpen ? (
                <button
                  onClick={handleJoinSplit}
                  disabled={loading}
                  className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <UserPlus size={16} /> {t('requestToJoin')}
                </button>
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
