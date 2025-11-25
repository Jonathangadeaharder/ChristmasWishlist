import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBUH9o31flNoxzCpIrrtSClAuimD5uiGxc',
  authDomain: 'christmaswishlist-297d8.firebaseapp.com',
  projectId: 'christmaswishlist-297d8',
  storageBucket: 'christmaswishlist-297d8.firebasestorage.app',
  messagingSenderId: '1092238271822',
  appId: '1:1092238271822:web:15b74835ef6dcd918eea1f',
  measurementId: 'G-WQMR2SQ3VB',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
