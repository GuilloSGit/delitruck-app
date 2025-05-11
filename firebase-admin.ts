// Firebase Admin SDK initialization for backend (Node.js)
// This file should be imported only in server-side code (API routes, etc.)
// Never expose admin credentials to the client!

import { initializeApp, cert, getApps, App } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { getDatabase } from 'firebase-admin/database'
import * as admin from 'firebase-admin'
import fs from 'fs'

// Use env variable for credentials
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

if (!serviceAccountPath) {
  throw new Error('No GOOGLE_APPLICATION_CREDENTIALS env var set!')
}

// Lee el archivo de credenciales de forma síncrona y lo parsea
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))

// Avoid double initialization in dev/hot-reload
const adminApp: App = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })

// Export helpers
export { adminApp }
export const adminStorage = getStorage(adminApp)
export const adminDatabase = getDatabase(adminApp)
export default admin
