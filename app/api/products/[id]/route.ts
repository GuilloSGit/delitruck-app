import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, set, update, remove } from 'firebase/database'

// Lee un producto por id desde Firebase
async function readProductById(id: string) {
  const snapshot = await get(ref(db, `products/${id}`))
  return snapshot.exists() ? snapshot.val() : null
}

// Actualiza un producto por id en Firebase
async function updateProductById(id: string, data: any) {
  await update(ref(db, `products/${id}`), data)
}

// Elimina un producto por id en Firebase
async function deleteProductById(id: string) {
  await remove(ref(db, `products/${id}`))
}
// GET product by id
export async function GET(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const product = await readProductById(id)
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al obtener producto:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

// PATCH update product by id
export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const contentType = request.headers.get('content-type') || ''
    let data: any = {}
    if (contentType.includes('application/json')) {
      data = await request.json()
      // Si viene stockDelta, hay que leer el producto, sumar y actualizar solo el campo stock
      if (typeof data.stockDelta !== 'undefined') {
        const product = await readProductById(id)
        if (!product) {
          return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
        }
        const newStock = Math.max(0, (product.stock || 0) + Number(data.stockDelta))
        await updateProductById(id, { stock: newStock, updatedAt: new Date().toISOString() })
        return NextResponse.json({ ...product, stock: newStock, updatedAt: new Date().toISOString() })
      }
      // Actualización genérica de campos
      data.updatedAt = new Date().toISOString()
      await updateProductById(id, data)
      const updated = await readProductById(id)
      return NextResponse.json(updated)
    } else if (contentType.includes('multipart/form-data')) {
      // Si necesitas soportar imágenes, aquí deberías agregar lógica similar a la de POST
      return NextResponse.json({ error: 'No implementado: multipart/form-data' }, { status: 501 })
    }
    return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 })
  } catch (error) {
    console.error('Error al actualizar producto:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE product by id
export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { id } = await context.params;
  try {
    const product = await readProductById(id)
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    await deleteProductById(id)
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error al eliminar producto:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}