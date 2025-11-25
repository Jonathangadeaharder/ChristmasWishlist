import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import { WishlistItemCard } from './WishlistItemCard'
import type { WishlistItem } from '../types'

describe('WishlistItemCard', () => {
  const mockItem: WishlistItem = {
    id: '1',
    title: 'Test Gift',
    description: 'A wonderful test gift',
    url: 'https://example.com/gift',
    price: '$99.99',
    priority: 'high',
    createdAt: Date.now(),
  }

  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders item title', () => {
    render(<WishlistItemCard item={mockItem} onDelete={mockOnDelete} />)
    expect(screen.getByText('Test Gift')).toBeInTheDocument()
  })

  it('renders item description', () => {
    render(<WishlistItemCard item={mockItem} onDelete={mockOnDelete} />)
    expect(screen.getByText('A wonderful test gift')).toBeInTheDocument()
  })

  it('renders item price', () => {
    render(<WishlistItemCard item={mockItem} onDelete={mockOnDelete} />)
    expect(screen.getByText(/\$99\.99/)).toBeInTheDocument()
  })

  it('renders priority badge', () => {
    render(<WishlistItemCard item={mockItem} onDelete={mockOnDelete} />)
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('renders link when url is provided', () => {
    render(<WishlistItemCard item={mockItem} onDelete={mockOnDelete} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/gift')
  })

  it('calls onDelete when delete button is clicked', () => {
    render(<WishlistItemCard item={mockItem} onDelete={mockOnDelete} />)
    const deleteButton = screen.getByRole('button')
    fireEvent.click(deleteButton)
    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('renders without optional fields', () => {
    const minimalItem: WishlistItem = {
      id: '2',
      title: 'Minimal Gift',
      priority: 'low',
      createdAt: Date.now(),
    }

    render(<WishlistItemCard item={minimalItem} onDelete={mockOnDelete} />)
    expect(screen.getByText('Minimal Gift')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
  })
})
