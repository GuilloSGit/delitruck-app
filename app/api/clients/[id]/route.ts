// API REST para clientes por ID usando Firebase Realtime Database
// Soporta GET, PUT y DELETE
import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, set, remove } from 'firebase/database'

// GET cliente por id
export async function GET(request: Request, context: { params: { id: string } }) {
  // Extrae el id del parámetro de ruta
  const { id } = await context.params
  // Busca el cliente en la base de datos
  const snapshot = await get(ref(db, `clients/${id}`))
  if (!snapshot.exists()) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
  }
  return NextResponse.json(snapshot.val())
}

// PUT actualizar cliente por id
export async function PUT(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params
  const body = await request.json()
  const now = new Date().toISOString()
  // Actualiza el cliente, manteniendo el id y la fecha de actualización
  const updatedClient = { ...body, id, updatedAt: now }
  await set(ref(db, `clients/${id}`), updatedClient)
  return NextResponse.json(updatedClient)
}

// DELETE eliminar cliente por id
export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params
  await remove(ref(db, `clients/${id}`))
  return NextResponse.json({ ok: true })
}
