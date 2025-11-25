import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Users, Loader2 } from 'lucide-react'
import { useLanguage } from '../i18n'

// Lazy load the FriendList component
const FriendList = lazy(() =>
  import('./FriendList').then(module => ({ default: module.FriendList }))
)

/**
 * Loading placeholder for FriendList
 */
const FriendListSkeleton: React.FC = () => {
  const { t } = useLanguage()

  return (
    <div className="card-festive h-full p-5" data-testid="friend-list-loading">
      <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-800">
        <Users size={22} className="text-green-600" />
        {t('friends')}
      </h3>
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <p className="mt-2 text-sm text-gray-500">{t('loading')}</p>
      </div>
    </div>
  )
}

/**
 * Hook to detect if we're on mobile
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

interface LazyFriendListProps {
  /** Force eager loading even on mobile */
  forceEager?: boolean
}

/**
 * LazyFriendList - Lazy loads the FriendList component
 *
 * On mobile, the FriendList is below the fold, so we lazy load it
 * to improve initial page load performance.
 * On desktop, it's visible immediately, so we load it eagerly.
 */
export const LazyFriendList: React.FC<LazyFriendListProps> = ({ forceEager = false }) => {
  const isMobile = useIsMobile()
  const [shouldLoad, setShouldLoad] = useState(() => !isMobile || forceEager)

  useEffect(() => {
    // Only defer loading on mobile when not force eager
    if (isMobile && !forceEager && !shouldLoad) {
      // On mobile, defer loading until after initial render
      // This uses requestIdleCallback if available, otherwise setTimeout
      const load = () => setShouldLoad(true)

      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(load, { timeout: 2000 })
        return () => window.cancelIdleCallback(id)
      } else {
        const id = setTimeout(load, 100)
        return () => clearTimeout(id)
      }
    }
  }, [isMobile, forceEager, shouldLoad])

  if (!shouldLoad) {
    return <FriendListSkeleton />
  }

  return (
    <Suspense fallback={<FriendListSkeleton />}>
      <FriendList />
    </Suspense>
  )
}

export default LazyFriendList
