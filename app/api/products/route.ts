import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, set, push } from 'firebase/database'
import { randomUUID } from 'crypto'

// Lee productos desde Firebase
async function readProducts() {
  const snapshot = await get(ref(db, 'products'))
  return snapshot.exists() ? Object.values(snapshot.val()) : []
}

// Escribe productos en Firebase (sobrescribe toda la colección)
async function writeProducts(products: any[]) {
  await set(ref(db, 'products'), products.reduce((acc, p) => { acc[p.id] = p; return acc }, {}))
}


export async function GET() {
  try {
    const products = await readProducts()
    // Ordenar por createdAt descendente
    products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error al obtener productos:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Parse multipart/form-data usando Web API
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'El request debe ser multipart/form-data' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name')?.toString() || ''
    const price = Number(formData.get('price') || 0)
    const description = formData.get('description')?.toString() || ''
    const stock = Number(formData.get('stock') || 0)
    let imageBase64 = ''
    const imageInput = formData.get('image')
    if (imageInput && typeof imageInput === 'string' && imageInput.startsWith('data:')) {
      // base64 string (data URL)
      imageBase64 = imageInput
    } else if (imageInput && typeof imageInput === 'object' && 'arrayBuffer' in imageInput) {
      // File object (from FormData)
      const file = imageInput as File
      const arrBuf = await file.arrayBuffer()
      const base64String = Buffer.from(arrBuf).toString('base64')
      imageBase64 = `data:${file.type};base64,${base64String}`
    }
    const now = new Date().toISOString()
    const id = randomUUID()
    const newProduct = {
      id,
      name,
      description,
      price,
      imageBase64,
      stock,
      createdAt: now,
      updatedAt: now
    }
    // Escribir en Firebase
    await set(ref(db, `products/${id}`), newProduct)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}

