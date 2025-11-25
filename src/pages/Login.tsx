import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react'
import { useLanguage } from '../i18n'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

const Login: React.FC = () => {
  const { t } = useLanguage()
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
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" data-testid="login-page">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="animate-float mb-4 text-6xl">🎄</div>
          <h1 className="text-3xl font-bold text-gray-800">{t('appName')}</h1>
          <p className="mt-2 text-gray-500">{t('welcomeBack')}</p>
        </div>

        {/* Form Card */}
        <div className="card-festive p-8">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">{t('signIn')}</h2>

          {error && (
            <div
              className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              data-testid="login-error"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
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
                  data-testid="login-email-input"
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
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  data-testid="login-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex w-full items-center justify-center gap-2"
              data-testid="login-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  {t('signIn')}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('noAccount')}{' '}
              <Link
                to="/register"
                className="font-semibold text-green-600 transition-colors hover:text-green-700"
                data-testid="register-link"
              >
                {t('createOne')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-400">{t('giftGivingMagic')}</p>
      </div>
    </div>
  )
}

export default Login
