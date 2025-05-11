import { NextResponse } from 'next/server'
import { adminApp, adminStorage, adminDatabase } from '@/firebase-admin'

export async function GET() {
  try {
    // Prueba acceso a Storage (obtiene el bucket)
    const bucket = adminStorage.bucket()
    const [files] = await bucket.getFiles({ maxResults: 1 })

    // Prueba acceso a Database (lee la raíz)
    const dbRef = adminDatabase.ref('/')
    const snapshot = await dbRef.once('value')
    const dbRoot = snapshot.val()

    return NextResponse.json({
      storageFiles: files.map((f: any) => f.name),
      databaseRootKeys: dbRoot ? Object.keys(dbRoot) : [],
      ok: true
    })
  } catch (error) {
    let message: string = 'Unknown error'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }
    return NextResponse.json({ error: message, ok: false }, { status: 500 })
  }
}