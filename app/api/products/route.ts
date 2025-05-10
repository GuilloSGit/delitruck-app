import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json')

async function readProducts() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
    // Si el archivo no existe, lo creamos vacío
    if ((err as any).code === 'ENOENT') {
      await fs.writeFile(DATA_PATH, '[]', 'utf-8')
      return []
    }
    throw err
  }
}

async function writeProducts(products: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2), 'utf-8')
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
    // description y stock opcionales
    const description = formData.get('description')?.toString() || ''
    const stock = Number(formData.get('stock') || 0)
    // Image can be base64 string or File object
    let imageUrl = ''
    const imageInput = formData.get('image')
    if (imageInput) {
      // Ensure uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      try {
        await fs.mkdir(uploadDir, { recursive: true })
      } catch (e) {}
      let buffer: Buffer | null = null
      let ext = 'png'
      if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
        // base64 string (data URL)
        const matches = imageInput.match(/^data:(image\/\w+);base64,(.+)$/)
        if (matches) {
          const mimeType = matches[1]
          ext = mimeType.split('/')[1]
          buffer = Buffer.from(matches[2], 'base64')
        }
      } else if (typeof imageInput === 'object' && 'arrayBuffer' in imageInput) {
        // File object (from FormData)
        const file = imageInput as File
        const arrBuf = await file.arrayBuffer()
        buffer = Buffer.from(arrBuf)
        const mimeType = file.type
        if (mimeType && mimeType.startsWith('image/')) {
          ext = mimeType.split('/')[1]
        }
      }
      if (buffer) {
        const filename = `${randomUUID()}.${ext}`
        const filepath = path.join(uploadDir, filename)
        await fs.writeFile(filepath, buffer)
        imageUrl = `/uploads/${filename}`
      }
    }
    const now = new Date().toISOString()
    let products = await readProducts()
    const newProduct = {
      id: randomUUID(),
      name,
      description,
      price,
      imageUrl: imageUrl || '',
      stock,
      createdAt: now,
      updatedAt: now
    }
    products.push(newProduct)
    await writeProducts(products)
    return NextResponse.json(newProduct)
  } catch (error) {
    console.error('Error al crear producto:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}

