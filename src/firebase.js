import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBupTbzHkTDjAC_NOI9o3PiRsT96cYzR5s",
  authDomain: "microsaas-6047e.firebaseapp.com",
  projectId: "microsaas-6047e",
  storageBucket: "microsaas-6047e.firebasestorage.app",
  messagingSenderId: "942694293849",
  appId: "1:942694293849:web:a491042d0e27e34781ac48",
  measurementId: "G-4CM1QQRTQG"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
