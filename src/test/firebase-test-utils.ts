/**
 * Firebase Test Utilities
 *
 * Utilities for testing with Firebase Emulator Suite.
 * Run `firebase emulators:start` before running integration tests.
 */
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type Auth,
} from 'firebase/auth'
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  type Firestore,
} from 'firebase/firestore'

let testApp: FirebaseApp | null = null
let testAuth: Auth | null = null
let testDb: Firestore | null = null

const TEST_PROJECT_ID = 'christmaswishlist-test'

/**
 * Initialize Firebase for testing with emulators
 */
export const initializeTestFirebase = () => {
  if (testApp) return { auth: testAuth!, db: testDb! }

  testApp = initializeApp(
    {
      apiKey: 'test-api-key',
      authDomain: `${TEST_PROJECT_ID}.firebaseapp.com`,
      projectId: TEST_PROJECT_ID,
    },
    'test-app'
  )

  testAuth = getAuth(testApp)
  testDb = getFirestore(testApp)

  // Connect to emulators
  connectAuthEmulator(testAuth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(testDb, 'localhost', 8080)

  return { auth: testAuth, db: testDb }
}

/**
 * Clean up Firebase test instance
 */
export const cleanupTestFirebase = async () => {
  if (testApp) {
    await deleteApp(testApp)
    testApp = null
    testAuth = null
    testDb = null
  }
}

/**
 * Create a test user in the Auth emulator
 */
export const createTestUser = async (email: string, password: string) => {
  const { auth } = initializeTestFirebase()
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error: unknown) {
    // User might already exist, try to sign in
    if ((error as { code?: string }).code === 'auth/email-already-in-use') {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    }
    throw error
  }
}

/**
 * Sign in a test user
 */
export const signInTestUser = async (email: string, password: string) => {
  const { auth } = initializeTestFirebase()
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}

/**
 * Create a test user profile in Firestore
 */
export const createTestUserProfile = async (
  uid: string,
  data: {
    email: string
    displayName?: string
  }
) => {
  const { db } = initializeTestFirebase()
  await setDoc(doc(db, 'users', uid), {
    uid,
    email: data.email,
    displayName: data.displayName || '',
    displayNameLower: (data.displayName || '').toLowerCase(),
  })
}

/**
 * Clear all data from a Firestore collection
 */
export const clearCollection = async (collectionPath: string) => {
  const { db } = initializeTestFirebase()
  const snapshot = await getDocs(collection(db, collectionPath))
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}

/**
 * Clear all test data from Firestore
 * Note: In a real scenario, you might use the Emulator REST API to clear all data
 */
export const clearAllTestData = async () => {
  await clearCollection('users')
}

/**
 * Generate a unique test email
 */
export const generateTestEmail = () => {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`
}
