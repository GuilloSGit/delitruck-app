import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

const DATA_PATH = path.join(process.cwd(), 'data', 'sales.json')

async function readSales() {
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

async function writeSales(sales: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(sales, null, 2), 'utf-8')
}

// GET sale by id
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const params = await context.params
  try {
    const sales = await readSales()
    const sale = sales.find((s: any) => s.id === params.id)
    if (!sale) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }
    // Enriquecer con el cliente
    const clientsPath = path.join(process.cwd(), 'data', 'clients.json')
    let clients: any[] = []
    try {
      const clientsRaw = await fs.readFile(clientsPath, 'utf-8')
      clients = JSON.parse(clientsRaw)
    } catch (err) {
      clients = []
    }
    const customer = clients.find((c: any) => c.id === sale.clientId) || null
    // Leer productos
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    let products: any[] = []
    try {
      const productsRaw = await fs.readFile(productsPath, 'utf-8')
      products = JSON.parse(productsRaw)
    } catch (err) {
      products = []
    }
    let itemsChanged = false
    const items = (sale.items || sale.products || []).map((item: any) => {
      // Normalizar campos para evitar NaN
      let price = item.price
      if (price === undefined && item.unitPrice !== undefined) price = item.unitPrice
      if (typeof price !== 'number') price = Number(price)
      if (isNaN(price)) price = 0
      let quantity = item.quantity
      if (typeof quantity !== 'number') quantity = Number(quantity)
      if (isNaN(quantity)) quantity = 0
      let id = item.id
      if (!id) {
        id = randomUUID()
        itemsChanged = true
      }
      return {
        ...item,
        id,
        price,
        quantity,
        product: products.find((p: any) => p.id === item.productId) || null
      }
    })
    // Si algún item fue modificado (se le asignó id), persistir el cambio
    if (itemsChanged) {
      const sales = await readSales()
      const idx = sales.findIndex((s: any) => s.id === sale.id)
      if (idx !== -1) {
        const newItems = items.map(({ product, ...rest }: any) => rest)
        if (sales[idx].items) sales[idx].items = newItems
        if (sales[idx].products) sales[idx].products = newItems
        await writeSales(sales)
      }
    }
    return NextResponse.json({ ...sale, customer, items })
  } catch (error) {
    console.error('Error al obtener venta:', error)
    return NextResponse.json(
      { error: 'Error al obtener venta' },
      { status: 500 }
    )
  }
}

// PATCH update sale by id
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  try {
    const json = await request.json()
    const sales = await readSales()
    const idx = sales.findIndex((s: any) => s.id === id)
    if (idx === -1) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }
    sales[idx] = {
      ...sales[idx],
      ...json,
      updatedAt: new Date().toISOString()
    }
    await writeSales(sales)
    // Enriquecer respuesta igual que GET
    const sale = sales[idx]
    // Buscar cliente
    const clientsPath = path.join(process.cwd(), 'data', 'clients.json')
    let clients: any[] = []
    try {
      const clientsRaw = await fs.readFile(clientsPath, 'utf-8')
      clients = JSON.parse(clientsRaw)
    } catch (err) {
      clients = []
    }
    const customer = clients.find((c: any) => c.id === sale.clientId) || { name: 'Cliente desconocido' }
    // Buscar productos
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    let products: any[] = []
    try {
      const productsRaw = await fs.readFile(productsPath, 'utf-8')
      products = JSON.parse(productsRaw)
    } catch (err) {
      products = []
    }
    let itemsChanged = false
    const items = (sale.items || sale.products || []).map((item: any) => {
      let price = item.price
      if (price === undefined && item.unitPrice !== undefined) price = item.unitPrice
      if (typeof price !== 'number') price = Number(price)
      if (isNaN(price)) price = 0
      let quantity = item.quantity
      if (typeof quantity !== 'number') quantity = Number(quantity)
      if (isNaN(quantity)) quantity = 0
      let id = item.id
      if (!id) {
        id = randomUUID()
        itemsChanged = true
      }
      return {
        ...item,
        id,
        price,
        quantity,
        product: products.find((p: any) => p.id === item.productId) || null
      }
    })
    if (itemsChanged) {
      const idx2 = sales.findIndex((s: any) => s.id === sale.id)
      if (idx2 !== -1) {
        const newItems = items.map(({ product, ...rest }: any) => rest)
        if (sales[idx2].items) sales[idx2].items = newItems
        if (sales[idx2].products) sales[idx2].products = newItems
        await writeSales(sales)
      }
    }
    return NextResponse.json({ ...sale, customer, items })
  } catch (error) {
    console.error('Error al actualizar venta:', error)
    return NextResponse.json(
      { error: 'Error al actualizar venta' },
      { status: 500 }
    )
  }
}

// DELETE sale by id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sales = await readSales()
    const idx = sales.findIndex((s: any) => s.id === params.id)
    if (idx === -1) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      )
    }
    sales.splice(idx, 1)
    await writeSales(sales)
    return new NextResponse(null, { status: 204 }) // No Content
  } catch (error) {
    console.error('Error al eliminar venta:', error)
    return NextResponse.json(
      { error: 'Error al eliminar venta' },
      { status: 500 }
    )
  }
}
