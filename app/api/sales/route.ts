// API para ventas usando Firebase
import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, set } from 'firebase/database'
import { randomUUID } from 'crypto'

async function readSales() {
  const snapshot = await get(ref(db, 'sales'))
  return snapshot.exists() ? Object.values(snapshot.val()) : []
}

export async function GET() {
  try {
    const sales = await readSales()
    sales.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener ventas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    const newSale = {
      ...body,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    }
    await set(ref(db, `sales/${newSale.id}`), newSale)
    return NextResponse.json(newSale)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear venta' }, { status: 500 })
  }
}
