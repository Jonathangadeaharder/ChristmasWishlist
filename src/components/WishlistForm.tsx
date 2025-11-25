import React, { useState } from 'react'
import type { WishlistItem } from '../types'
import { Gift, Link as LinkIcon, DollarSign, Star, X, Loader2 } from 'lucide-react'
import { useLanguage } from '../i18n'

interface Props {
  onSubmit: (item: Omit<WishlistItem, 'id' | 'createdAt'>) => Promise<void>
  onCancel: () => void
}

export const WishlistForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const { t } = useLanguage()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [priority, setPriority] = useState<WishlistItem['priority']>('medium')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ title, description, url, price, priority })
      setTitle('')
      setDescription('')
      setUrl('')
      setPrice('')
      setPriority('medium')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-festive mb-6 p-6" data-testid="wishlist-form">
      <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
        <Gift className="text-red-500" size={24} />
        <h3 className="text-lg font-bold text-gray-800">{t('addNewWish')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-semibold text-gray-700">
            {t('whatDoYouWish')} *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input-festive"
            placeholder={t('wishPlaceholder')}
            required
            data-testid="wishlist-title-input"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">
            {t('description')}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input-festive min-h-[80px] resize-none"
            placeholder={t('descriptionPlaceholder')}
            rows={3}
            data-testid="wishlist-description-input"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="url" className="mb-2 block text-sm font-semibold text-gray-700">
              <LinkIcon size={14} className="mr-1 inline" />
              {t('linkOptional')}
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input-festive"
              placeholder="https://..."
              data-testid="wishlist-url-input"
            />
          </div>
          <div>
            <label htmlFor="price" className="mb-2 block text-sm font-semibold text-gray-700">
              <DollarSign size={14} className="mr-1 inline" />
              {t('priceOptional')}
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="input-festive"
              placeholder="$49.99"
              data-testid="wishlist-price-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="priority" className="mb-2 block text-sm font-semibold text-gray-700">
            <Star size={14} className="mr-1 inline" />
            {t('howMuchWant')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                data-testid={`priority-${p}`}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  priority === p
                    ? p === 'low'
                      ? 'scale-105 bg-green-500 text-white shadow-lg'
                      : p === 'medium'
                        ? 'scale-105 bg-yellow-500 text-white shadow-lg'
                        : 'scale-105 bg-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p === 'low'
                  ? `😊 ${t('niceToHave')}`
                  : p === 'medium'
                    ? `🙏 ${t('wouldLove')}`
                    : `🎯 ${t('mustHave')}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost flex items-center gap-2"
          data-testid="wishlist-cancel-button"
        >
          <X size={18} />
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="wishlist-submit-button"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('loading')}
            </>
          ) : (
            <>
              <Gift size={18} />
              {t('addToWishlist')}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
