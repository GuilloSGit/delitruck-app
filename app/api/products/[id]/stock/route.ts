import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, update } from 'firebase/database'

// Lee un producto por id desde Firebase
async function readProductById(id: string) {
  const snapshot = await get(ref(db, `products/${id}`))
  return snapshot.exists() ? snapshot.val() : null
}

// Actualiza un producto por id en Firebase
async function updateProductById(id: string, data: any) {
  await update(ref(db, `products/${id}`), data)
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { quantity } = json
    const id = params.id
    const product = await readProductById(id)
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    // Ajustar el stock
    const newStock = (product.stock || 0) + Number(quantity)
    const updatedAt = new Date().toISOString()
    await updateProductById(id, { stock: newStock, updatedAt })
    return NextResponse.json({ ...product, stock: newStock, updatedAt })
  } catch (error) {
    console.error('Error al ajustar el stock:', error)
    return NextResponse.json(
      { error: 'Error al ajustar el stock' },
      { status: 500 }
    )
  }
}
