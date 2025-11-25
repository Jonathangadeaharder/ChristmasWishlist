import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

/**
 * Test Setup Configuration
 *
 * This setup supports two modes:
 * 1. Unit Tests (default): Firebase is mocked for fast, isolated tests
 * 2. Integration Tests: Uses Firebase Emulator Suite for realistic tests
 *
 * To run integration tests:
 * 1. Start emulators: `firebase emulators:start`
 * 2. Run tests with: `VITE_USE_EMULATOR=true npm run test`
 */

// Check if we should use emulator (set via vitest config or env)
const USE_EMULATOR = import.meta.env.VITE_USE_EMULATOR === 'true'

// Mock environment variables for unit tests
vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key')
vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test.firebaseapp.com')
vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project')
vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test.appspot.com')
vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789')
vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:abc123')

if (!USE_EMULATOR) {
  // Mock Firebase for unit tests (fast, isolated)
  vi.mock('../services/firebase', () => ({
    auth: {
      signOut: vi.fn(),
      onAuthStateChanged: vi.fn(),
      currentUser: null,
    },
    db: {},
  }))
} else {
  // Use real Firebase with Emulator Suite for integration tests
  vi.stubEnv('VITE_USE_EMULATOR', 'true')

  // Import cleanup utilities for integration tests
  beforeAll(async () => {
    console.log('🔥 Running with Firebase Emulator Suite')
    // Emulator connection is handled in firebase.ts
  })

  afterAll(async () => {
    // Clean up after integration tests
    const { cleanupTestFirebase } = await import('./firebase-test-utils')
    await cleanupTestFirebase()
  })
}

// Mock window.confirm for all tests
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(() => true),
})

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
