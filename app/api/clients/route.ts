// API para clientes usando Firebase
import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, set } from 'firebase/database'
import { randomUUID } from 'crypto'

async function readClients() {
  const snapshot = await get(ref(db, 'clients'))
  return snapshot.exists() ? Object.values(snapshot.val()) : []
}

export async function GET() {
  try {
    const clients = await readClients()
    clients.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const newClient = {
      ...body,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    await set(ref(db, `clients/${newClient.id}`), newClient)
    return NextResponse.json(newClient)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}
