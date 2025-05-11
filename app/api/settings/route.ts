// API para settings usando Firebase
import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, set } from 'firebase/database'

export async function GET() {
  try {
    const snapshot = await get(ref(db, 'settings'))
    const settings = snapshot.exists() ? snapshot.val() : {}
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    await set(ref(db, 'settings'), body)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar settings' }, { status: 500 })
  }
}
