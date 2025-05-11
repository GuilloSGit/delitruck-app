// API REST para ventas por ID usando Firebase Realtime Database
// Soporta GET y DELETE (agrega PUT si lo necesitas)
import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, remove } from 'firebase/database'

// GET venta por id
export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params
  const snapshot = await get(ref(db, `sales/${id}`))
  if (!snapshot.exists()) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
  }
  const sale = snapshot.val()

  // --- Normalización y populate ---
  // Si tiene 'products' pero no 'items', conviértelo
  if (!Array.isArray(sale.items) && Array.isArray(sale.products)) {
    sale.items = sale.products.map((p: any, idx: any) => ({
      id: p.id || `${sale.id}-item-${idx}`,
      productId: p.productId,
      quantity: p.quantity,
      price: p.price,
      product: p.product // por si ya está expandido
    }))
  }
  if (!Array.isArray(sale.items)) {
    sale.items = []
  } else {
    sale.items = await Promise.all(
      sale.items
        .filter((item: any) => item && item.productId)
        .map(async (item: any) => {
          if (!item.product && item.productId) {
            const prodSnap = await get(ref(db, `products/${item.productId}`))
            item.product = prodSnap.exists() ? prodSnap.val() : null
          }
          return item
        })
    )
  }
  // Solo items con producto expandido válido
  sale.items = sale.items.filter((item: any) => item.product)
  sale.total = sale.items.reduce(
    (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0),
    0
  )

  return NextResponse.json(sale)
}

// DELETE eliminar venta por id
export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params
  await remove(ref(db, `sales/${id}`))
  return NextResponse.json({ ok: true })
}
