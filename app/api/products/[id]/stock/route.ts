import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json')

async function readProducts() {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (err) {
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

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const { quantity } = json
    let products = await readProducts()
    const idx = products.findIndex((p: any) => p.id === params.id)
    if (idx === -1) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    // Ajustar el stock
    products[idx].stock = (products[idx].stock || 0) + Number(quantity)
    products[idx].updatedAt = new Date().toISOString()
    await writeProducts(products)
    return NextResponse.json(products[idx])
  } catch (error) {
    console.error('Error al ajustar el stock:', error)
    return NextResponse.json(
      { error: 'Error al ajustar el stock' },
      { status: 500 }
    )
  }
}
