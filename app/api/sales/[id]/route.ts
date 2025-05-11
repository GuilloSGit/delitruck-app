// API REST para ventas por ID usando Firebase Realtime Database
// Soporta GET y DELETE (agrega PUT si lo necesitas)
import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, remove } from 'firebase/database'

// GET venta por id
export async function GET(request: Request, context: { params: { id: string } }) {
  // Extrae el id del parámetro de ruta
  const { id } = await context.params
  // Busca la venta en la base de datos
  const snapshot = await get(ref(db, `sales/${id}`))
  if (!snapshot.exists()) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
  }
  return NextResponse.json(snapshot.val())
}

// DELETE eliminar venta por id
export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params
  await remove(ref(db, `sales/${id}`))
  return NextResponse.json({ ok: true })
}
