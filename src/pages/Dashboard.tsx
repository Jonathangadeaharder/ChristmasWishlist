import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { auth } from '../services/firebase'
import type { WishlistItem } from '../types'
import { getUserWishlist, addWishlistItem, deleteWishlistItem } from '../services/wishlist'
import { WishlistForm } from '../components/WishlistForm'
import { WishlistItemCard } from '../components/WishlistItemCard'
import { FriendList } from '../components/FriendList'
import { Plus, Gift, LogOut, Sparkles } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getUserWishlist(currentUser.uid, fetchedItems => {
        setItems(fetchedItems)
      })
      return () => unsubscribe()
    }
  }, [currentUser])

  const handleAddItem = async (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    if (currentUser) {
      await addWishlistItem(currentUser.uid, item)
      setShowForm(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (currentUser && window.confirm('Are you sure you want to delete this item?')) {
      await deleteWishlistItem(currentUser.uid, id)
    }
  }

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
      {/* Festive Navbar */}
      <nav className="navbar-festive festive-border px-6 py-4 text-white" data-testid="navbar">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="animate-float text-3xl">🎄</span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Christmas Wishlist</h1>
              <p className="text-xs text-red-100 opacity-80">Make your wishes come true</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:flex">
              <Sparkles size={14} className="animate-twinkle" />
              <span className="text-sm" data-testid="user-email">
                {currentUser?.email}
              </span>
            </div>
            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-lg transition-all hover:scale-105 hover:bg-red-50 active:scale-95"
              data-testid="logout-button"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Wishlist Section */}
          <div className="lg:col-span-2">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
                  <Gift className="text-red-500" size={28} />
                  My Wishlist
                </h2>
                <p className="mt-1 text-gray-500" data-testid="wishlist-count">
                  {items.length} {items.length === 1 ? 'item' : 'items'} on your list
                </p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-success group flex items-center gap-2"
                  data-testid="add-item-button"
                >
                  <Plus size={20} className="transition-transform group-hover:rotate-90" />
                  Add Item
                </button>
              )}
            </div>

            {showForm && (
              <div className="animate-slide-up">
                <WishlistForm onSubmit={handleAddItem} onCancel={() => setShowForm(false)} />
              </div>
            )}

            <div className="space-y-4" data-testid="wishlist-items">
              {items.length === 0 && !showForm ? (
                <div className="empty-state animate-slide-up" data-testid="empty-wishlist">
                  <div className="empty-state-icon">🎁</div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-700">
                    Your wishlist is empty
                  </h3>
                  <p className="mb-6 text-gray-500">
                    Start adding gifts you'd love to receive this Christmas!
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-success inline-flex items-center gap-2"
                    data-testid="add-first-item-button"
                  >
                    <Plus size={20} /> Add your first item
                  </button>
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <WishlistItemCard item={item} onDelete={handleDeleteItem} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Friends Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <FriendList />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>Made with ❤️ for the holiday season</p>
      </footer>
    </div>
  )
}

export default Dashboard
