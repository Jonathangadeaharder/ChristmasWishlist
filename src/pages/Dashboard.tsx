import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { auth } from '../services/firebase'
import type { WishlistItem } from '../types'
import { useWishlist, useAddWishlistItem, useDeleteWishlistItem } from '../hooks'
import { WishlistForm } from '../components/WishlistForm'
import { WishlistItemCard } from '../components/WishlistItemCard'
import { LazyFriendList } from '../components/LazyFriendList'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { Plus, Gift, LogOut, Sparkles, Loader2 } from 'lucide-react'
import { useLanguage } from '../i18n'

const Dashboard: React.FC = () => {
  const { t } = useLanguage()
  const { currentUser } = useAuth()
  const [showForm, setShowForm] = useState(false)

  // React Query hooks with real-time subscriptions
  const { data: items = [], isLoading } = useWishlist(currentUser?.uid)
  const addItemMutation = useAddWishlistItem(currentUser?.uid)
  const deleteItemMutation = useDeleteWishlistItem(currentUser?.uid)

  const handleAddItem = async (item: Omit<WishlistItem, 'id' | 'createdAt'>) => {
    if (currentUser) {
      await addItemMutation.mutateAsync(item)
      setShowForm(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (currentUser && window.confirm(t('confirmDelete'))) {
      deleteItemMutation.mutate(id)
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
              <h1 className="text-xl font-bold tracking-tight">{t('appName')}</h1>
              <p className="text-xs text-red-100 opacity-80">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
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
              <span className="hidden sm:inline">{t('logout')}</span>
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
                  {t('myWishlist')}
                </h2>
                <p className="mt-1 text-gray-500" data-testid="wishlist-count">
                  {items.length} {items.length === 1 ? t('item') : t('items')} {t('onYourList')}
                </p>
              </div>
              {!showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="btn-success group flex items-center gap-2"
                  data-testid="add-item-button"
                >
                  <Plus size={20} className="transition-transform group-hover:rotate-90" />
                  {t('addItem')}
                </button>
              )}
            </div>

            {showForm && (
              <div className="animate-slide-up">
                <WishlistForm onSubmit={handleAddItem} onCancel={() => setShowForm(false)} />
              </div>
            )}

            <div className="space-y-4" data-testid="wishlist-items">
              {isLoading ? (
                <div className="py-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
                  <p className="mt-2 text-gray-500">{t('loading')}</p>
                </div>
              ) : items.length === 0 && !showForm ? (
                <div className="empty-state animate-slide-up" data-testid="empty-wishlist">
                  <div className="empty-state-icon">🎁</div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-700">{t('emptyWishlist')}</h3>
                  <p className="mb-6 text-gray-500">{t('startAdding')}</p>
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="btn-success inline-flex items-center gap-2"
                    data-testid="add-first-item-button"
                  >
                    <Plus size={20} /> {t('addFirstItem')}
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
              <LazyFriendList />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>{t('madeWithLove')}</p>
      </footer>
    </div>
  )
}

export default Dashboard
