import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../services/firebase'
import { Link, useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { Mail, Lock, UserPlus, Loader2, AlertCircle, Gift, User } from 'lucide-react'
import { useLanguage } from '../i18n'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const Register: React.FC = () => {
  const { t } = useLanguage()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Create user document with displayName for search
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        uid: userCredential.user.uid,
        displayName: displayName.trim(),
        displayNameLower: displayName.trim().toLowerCase(), // For case-insensitive search
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-testid="register-page">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="animate-float mb-4 text-6xl">🎁</div>
          <h1 className="text-3xl font-bold text-gray-800">{t('joinFun')}</h1>
          <p className="mt-2 text-gray-500">{t('createWishlistShare')}</p>
        </div>

        {/* Form Card */}
        <div className="card-festive p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">{t('signUp')}</h2>

          {error && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              data-testid="register-error"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                {t('displayName')}
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="displayName"
                  type="text"
                  className="input-festive input-with-icon"
                  placeholder={t('displayNamePlaceholder')}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  autoComplete="name"
                  data-testid="register-name-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                {t('email')}
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="email"
                  type="email"
                  className="input-festive input-with-icon"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  data-testid="register-email-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                {t('password')}
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="password"
                  type="password"
                  className="input-festive input-with-icon"
                  placeholder={t('minChars')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  data-testid="register-password-input"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">{t('minChars')}</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-success flex w-full items-center justify-center gap-2"
              data-testid="register-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('creatingAccount')}
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  {t('signUp')}
                </>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <p className="mb-3 text-center text-xs text-gray-500">{t('whatYouGet')}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
              <div className="rounded-lg bg-gray-50 p-2">
                <Gift size={16} className="mx-auto mb-1 text-red-500" />
                {t('createWishlists')}
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <span className="text-lg">👥</span>
                <div>{t('addFriends')}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <span className="text-lg">🎉</span>
                <div>{t('noSpoilers')}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('hasAccount')}{' '}
              <Link
                to="/login"
                className="font-semibold text-red-600 transition-colors hover:text-red-700"
                data-testid="login-link"
              >
                {t('signInLink')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">{t('joyOfGiving')}</p>
      </div>
    </div>
  )
}

export default Register
