import React from 'react'
import type { WishlistItem } from '../types'
import { Trash2, ExternalLink, DollarSign, Star } from 'lucide-react'

interface Props {
  item: WishlistItem
  onDelete: (id: string) => void
}

export const WishlistItemCard: React.FC<Props> = ({ item, onDelete }) => {
  const priorityConfig = {
    low: { class: 'badge badge-low', icon: null, label: 'Nice to have' },
    medium: { class: 'badge badge-medium', icon: <Star size={12} />, label: 'Would love' },
    high: {
      class: 'badge badge-high',
      icon: <Star size={12} fill="currentColor" />,
      label: 'Must have!',
    },
  }

  const priority = priorityConfig[item.priority]

  return (
    <div className="card-festive group p-5" data-testid={`wishlist-item-${item.id}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3
              className="text-lg font-bold text-gray-800 transition-colors group-hover:text-red-600"
              data-testid="item-title"
            >
              {item.title}
            </h3>
            <span className={priority.class} data-testid="item-priority">
              {priority.icon}
              <span className="ml-1">{priority.label}</span>
            </span>
          </div>

          {item.description && (
            <p
              className="mb-3 text-sm leading-relaxed text-gray-600"
              data-testid="item-description"
            >
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            {item.price && (
              <span
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-gray-600"
                data-testid="item-price"
              >
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
                data-testid="item-link"
              >
                <ExternalLink size={14} />
                View item
              </a>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-2 text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
          title="Delete Item"
          aria-label="Delete item"
          data-testid="delete-item-button"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
