/**
 * Auth Feature Module
 *
 * Contains authentication-related components, hooks, and services
 */

// Re-export from existing locations for backwards compatibility
// These can be moved here incrementally
export { useAuth, AuthProvider } from '../../context/AuthContext'
export { auth } from '../../services/firebase'
