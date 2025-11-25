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
  useSuggestions,
  useAddSuggestion,
  useDeleteSuggestion,
} from '../hooks'
import type { WishlistItem, Suggestion } from '../types'
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
  Lightbulb,
  Plus,
  Trash2,
  Star,
  DollarSign,
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

  const priorityConfig = {
    low: { class: 'badge badge-low', icon: null, label: t('low') },
    medium: { class: 'badge badge-medium', icon: <Star size={12} />, label: t('medium') },
    high: {
      class: 'badge badge-high',
      icon: <Star size={12} fill="currentColor" />,
      label: t('high'),
    },
  }

  const priority = priorityConfig[item.priority]

  return (
    <div
      className={`card-festive group p-5 ${isTakenByOther && !giftStatus?.splitRequestOpen ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-red-600">
              {item.title}
            </h3>
            <span className={priority.class}>
              {priority.icon}
              <span className="ml-1">{priority.label}</span>
            </span>
            {giftStatus?.splitRequestOpen && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                <Users size={12} /> {t('lookingForSplit')}
              </span>
            )}
          </div>
          {item.description && (
            <p className="mb-3 text-sm leading-relaxed text-gray-600">{item.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            {item.price && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-gray-600">
                <DollarSign size={14} className="text-green-600" />
                {item.price}
              </span>
            )}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-600 transition-colors hover:bg-blue-100"
              >
                <ExternalLink size={14} />
                Link
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

/**
 * Suggestion Item Component - works like FriendWishlistItem but for suggestions
 */
interface SuggestionItemProps {
  suggestion: Suggestion
  friendId: string
  currentUserId: string
  currentUserEmail: string
  onDelete: (id: string) => void
  isDeleting: boolean
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  friendId,
  currentUserId,
  currentUserEmail,
  onDelete,
  isDeleting,
}) => {
  const { t } = useLanguage()
  const [showSplitOptions, setShowSplitOptions] = useState(false)

  // Gift status hooks for suggestions
  const { data: giftStatus } = useGiftStatus(friendId, suggestion.id, 'suggestions')
  const markMutation = useMarkItemAsTaken(friendId, 'suggestions')
  const unmarkMutation = useUnmarkItemAsTaken(friendId, 'suggestions')
  const toggleSplitMutation = useToggleSplitRequest(friendId, 'suggestions')
  const joinSplitMutation = useRequestToJoinSplit(friendId, 'suggestions')
  const confirmMutation = useConfirmContributor(friendId, 'suggestions')
  const removeMutation = useRemoveContributor(friendId, 'suggestions')

  const loading =
    markMutation.isPending ||
    unmarkMutation.isPending ||
    toggleSplitMutation.isPending ||
    joinSplitMutation.isPending ||
    confirmMutation.isPending ||
    removeMutation.isPending

  const handleMarkAsTaken = async () => {
    await markMutation.mutateAsync({
      itemId: suggestion.id,
      takenBy: currentUserId,
      takenByName: currentUserEmail,
    })
  }

  const handleUnmark = async () => {
    await unmarkMutation.mutateAsync(suggestion.id)
  }

  const handleToggleSplit = async (open: boolean) => {
    await toggleSplitMutation.mutateAsync({ itemId: suggestion.id, open })
    setShowSplitOptions(false)
  }

  const handleJoinSplit = async () => {
    await joinSplitMutation.mutateAsync({
      itemId: suggestion.id,
      contributorId: currentUserId,
      contributorName: currentUserEmail,
    })
  }

  const handleConfirmContributor = async (contributorId: string) => {
    await confirmMutation.mutateAsync({ itemId: suggestion.id, contributorId })
  }

  const handleRemoveContributor = async (contributorId: string) => {
    await removeMutation.mutateAsync({ itemId: suggestion.id, contributorId })
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

  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${isTakenByOther && !giftStatus?.splitRequestOpen ? 'border-gray-300 opacity-60' : 'border-amber-200'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" />
            <h4 className="font-bold text-gray-800">{suggestion.title}</h4>
            {giftStatus?.splitRequestOpen && (
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                <Users size={12} /> {t('lookingForSplit')}
              </span>
            )}
          </div>
          {suggestion.description && (
            <p className="mb-2 text-sm text-gray-600">{suggestion.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {suggestion.price && <span>💰 {suggestion.price}</span>}
            {suggestion.url && (
              <a
                href={suggestion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                🔗 Link <ExternalLink size={12} />
              </a>
            )}
            <span className="text-amber-600">
              {t('suggestedBy')}: {suggestion.suggestedByName}
            </span>
          </div>

          {/* Contributors list */}
          {confirmedContributors.length > 1 && (
            <div className="mt-3 border-t pt-3">
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-500">
                <Users size={14} /> {t('contributors')} ({confirmedContributors.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {confirmedContributors.map(c => (
                  <span
                    key={c.uid}
                    className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700"
                  >
                    <Check size={12} /> {c.name}
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
              <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Clock size={14} /> {t('pendingApproval')} ({pendingContributors.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingContributors.map(c => (
                  <span
                    key={c.uid}
                    className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700"
                  >
                    {c.name}
                    <button
                      onClick={() => handleConfirmContributor(c.uid)}
                      className="ml-1 text-green-600 hover:text-green-800"
                      title={t('confirmJoin')}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => handleRemoveContributor(c.uid)}
                      className="text-red-500 hover:text-red-700"
                      title={t('removeContributor')}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="ml-4 flex flex-col items-end gap-2">
          {/* Delete button for suggestion owner */}
          {suggestion.suggestedBy === currentUserId && !giftStatus?.isTaken && (
            <button
              onClick={() => onDelete(suggestion.id)}
              disabled={isDeleting}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              title={t('deleteSuggestion')}
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Gift status actions */}
          {isTakenByMe ? (
            <div className="flex flex-col items-end gap-2">
              <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                <Check size={16} /> {t('youreGettingThis')}
              </span>
              {!showSplitOptions ? (
                <button
                  onClick={() => setShowSplitOptions(true)}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <Users size={14} /> {t('splitWith')}
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  {!giftStatus?.splitRequestOpen ? (
                    <button
                      onClick={() => handleToggleSplit(true)}
                      disabled={loading}
                      className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200"
                    >
                      <UserPlus size={12} /> {t('lookingForSplit')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleSplit(false)}
                      disabled={loading}
                      className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                    >
                      <X size={12} /> {t('stopLookingForSplit')}
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={handleUnmark}
                disabled={loading}
                className="text-xs text-red-500 hover:underline"
              >
                {t('cancel')}
              </button>
            </div>
          ) : isTakenByOther ? (
            <div className="flex flex-col items-end gap-2">
              <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-600">
                {t('alreadyTaken')}
              </span>
              {giftStatus?.splitRequestOpen && !isContributor && (
                <button
                  onClick={handleJoinSplit}
                  disabled={loading}
                  className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                >
                  <UserPlus size={12} /> {t('requestToJoin')}
                </button>
              )}
              {isPendingContributor && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Clock size={12} /> {t('waitingForApproval')}
                </span>
              )}
              {isContributor && !isPendingContributor && (
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check size={12} /> {t('youJoined')}
                  </span>
                  <button
                    onClick={() => handleRemoveContributor(currentUserId)}
                    disabled={loading}
                    className="text-xs text-red-500 hover:underline"
                  >
                    {t('leaveSplit')}
                  </button>
                </div>
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

/**
 * Suggestions Section Component
 * Shows gift suggestions from friends (hidden from wishlist owner)
 */
interface SuggestionsSectionProps {
  friendId: string
  currentUserId: string
  currentUserEmail: string
}

const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({
  friendId,
  currentUserId,
  currentUserEmail,
}) => {
  const { t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')

  const { data: suggestions = [] } = useSuggestions(friendId)
  const addMutation = useAddSuggestion(friendId)
  const deleteMutation = useDeleteSuggestion(friendId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await addMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      price: price.trim() || undefined,
      suggestedBy: currentUserId,
      suggestedByName: currentUserEmail,
    })

    setTitle('')
    setDescription('')
    setUrl('')
    setPrice('')
    setShowForm(false)
  }

  const handleDelete = async (suggestionId: string) => {
    await deleteMutation.mutateAsync(suggestionId)
  }

  return (
    <div className="mt-8 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-bold text-amber-800">{t('suggestions')}</h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
        >
          <Plus size={16} /> {t('suggestGift')}
        </button>
      </div>

      <p className="mb-4 text-sm text-amber-700">{t('suggestionsInfo')}</p>

      {/* Add Suggestion Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 rounded-lg bg-white p-4 shadow">
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('suggestionTitle')} *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              placeholder={t('suggestionTitle')}
              required
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('suggestionDescription')}
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              rows={2}
              placeholder={t('suggestionDescription')}
            />
          </div>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('suggestionUrl')}
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('suggestionPrice')}
              </label>
              <input
                type="text"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                placeholder="€25"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!title.trim() || addMutation.isPending}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {addMutation.isPending ? t('loading') : t('addSuggestion')}
            </button>
          </div>
        </form>
      )}

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <p className="py-4 text-center text-sm text-amber-600">{t('noSuggestions')}</p>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion: Suggestion) => (
            <SuggestionItem
              key={suggestion.id}
              suggestion={suggestion}
              friendId={friendId}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
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
    <div className="min-h-screen">
      {/* Festive Navbar */}
      <nav className="navbar-festive festive-border px-6 py-4 text-white">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="animate-float text-3xl">🎄</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
              <p className="text-xs text-red-100 opacity-80">{t('tagline')}</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-lg transition-all hover:scale-105 hover:bg-red-50 active:scale-95"
          >
            <ArrowLeft size={16} /> {t('back')}
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
            <Gift className="text-red-500" size={28} />
            {friendEmail ? `${friendEmail}${t('wishlistOf')}` : t('myWishlist')}
          </h2>
          <p className="mt-2 text-gray-500">{t('selectItems')}</p>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
            <p className="mt-2 text-gray-500">{t('loading')}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="card-festive py-10 text-center text-gray-500">
            <Gift className="mx-auto mb-3 h-12 w-12 text-gray-300" />
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

        {/* Suggestions Section - visible to friends only */}
        <SuggestionsSection
          friendId={friendId}
          currentUserId={currentUser.uid}
          currentUserEmail={currentUser.email || ''}
        />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>{t('madeWithLove')}</p>
      </footer>
    </div>
  )
}

export default FriendWishlist
