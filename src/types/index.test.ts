import { describe, it, expect } from 'vitest'
import type { WishlistItem, UserProfile, GiftStatus, Suggestion } from './index'

describe('Types', () => {
  describe('WishlistItem', () => {
    it('should have correct structure', () => {
      const item: WishlistItem = {
        id: '1',
        title: 'Test Item',
        description: 'A test description',
        url: 'https://example.com',
        price: '$50',
        priority: 'high',
        createdAt: Date.now(),
      }

      expect(item.id).toBe('1')
      expect(item.title).toBe('Test Item')
      expect(item.priority).toBe('high')
    })

    it('should allow optional fields to be undefined', () => {
      const item: WishlistItem = {
        id: '2',
        title: 'Minimal Item',
        priority: 'low',
        createdAt: Date.now(),
      }

      expect(item.description).toBeUndefined()
      expect(item.url).toBeUndefined()
      expect(item.price).toBeUndefined()
    })

    it('should only accept valid priority values', () => {
      const priorities: WishlistItem['priority'][] = ['low', 'medium', 'high']
      priorities.forEach(priority => {
        const item: WishlistItem = {
          id: '1',
          title: 'Test',
          priority,
          createdAt: Date.now(),
        }
        expect(['low', 'medium', 'high']).toContain(item.priority)
      })
    })
  })

  describe('UserProfile', () => {
    it('should have correct structure', () => {
      const user: UserProfile = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
      }

      expect(user.uid).toBe('user123')
      expect(user.email).toBe('test@example.com')
      expect(user.displayName).toBe('Test User')
    })

    it('should allow displayName to be undefined', () => {
      const user: UserProfile = {
        uid: 'user123',
        email: 'test@example.com',
      }

      expect(user.displayName).toBeUndefined()
    })
  })

  describe('GiftStatus', () => {
    it('should have correct structure', () => {
      const status: GiftStatus = {
        isTaken: true,
        takenBy: 'user456',
        takenByName: 'Friend User',
      }

      expect(status.isTaken).toBe(true)
      expect(status.takenBy).toBe('user456')
      expect(status.takenByName).toBe('Friend User')
    })
  })

  describe('Suggestion', () => {
    it('should have correct structure', () => {
      const suggestion: Suggestion = {
        id: 'sug1',
        title: 'Suggested Gift',
        description: 'This would be a great gift',
        suggestedBy: 'user789',
        suggestedByName: 'Suggester',
        createdAt: Date.now(),
      }

      expect(suggestion.id).toBe('sug1')
      expect(suggestion.title).toBe('Suggested Gift')
      expect(suggestion.suggestedBy).toBe('user789')
    })
  })
})
