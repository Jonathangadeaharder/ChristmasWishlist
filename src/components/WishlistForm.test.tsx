import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import { WishlistForm } from './WishlistForm'

describe('WishlistForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields', () => {
    render(<WishlistForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<WishlistForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    render(<WishlistForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await user.type(screen.getByLabelText(/title/i), 'New Gift')
    await user.type(screen.getByLabelText(/description/i), 'A great gift')
    await user.type(screen.getByLabelText(/url/i), 'https://example.com')
    await user.type(screen.getByLabelText(/price/i), '$50')
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high')

    const submitButton = screen.getByRole('button', { name: /add item/i })
    await user.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Gift',
      description: 'A great gift',
      url: 'https://example.com',
      price: '$50',
      priority: 'high',
    })
  })

  it('requires title field', async () => {
    render(<WishlistForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const titleInput = screen.getByLabelText(/title/i)
    expect(titleInput).toBeRequired()
  })

  it('has default priority of medium', () => {
    render(<WishlistForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement
    expect(prioritySelect.value).toBe('medium')
  })
})
