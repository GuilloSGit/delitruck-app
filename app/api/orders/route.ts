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

// GET all sales
export async function GET() {
  try {
    const sales = await readSales()
    const clientsPath = path.join(process.cwd(), 'data', 'clients.json')
    let clients: any[] = []
    try {
      const clientsRaw = await fs.readFile(clientsPath, 'utf-8')
      clients = JSON.parse(clientsRaw)
    } catch (err) {
      clients = []
    }
    // Leer productos
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    let products: any[] = []
    try {
      const productsRaw = await fs.readFile(productsPath, 'utf-8')
      products = JSON.parse(productsRaw)
    } catch (err) {
      products = []
    }
    // Enriquecer cada venta con el cliente y los productos de cada item
    let itemsChanged = false
    const enrichedSales = sales.map((sale: any) => {
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
        // Enriquecer con datos del producto
        const productData = products.find((p: any) => p.id === item.productId) || null
        return {
          ...item,
          id,
          price,
          quantity,
          product: productData
            ? { name: productData.name || '', description: productData.description || '' }
            : { name: '[Producto eliminado]', description: '' }
        }
      })
      // Si algún item fue modificado (se le asignó id), persistir el cambio
      if (itemsChanged) {
        const idx = sales.findIndex((s: any) => s.id === sale.id)
        if (idx !== -1) {
          const newItems = items.map(({ product, ...rest }: any) => rest)
          if (sales[idx].items) sales[idx].items = newItems
          if (sales[idx].products) sales[idx].products = newItems
        }
      }
      return {
        ...sale,
        customer: clients.find((c: any) => c.id === sale.clientId) || { name: 'Cliente desconocido' },
        items
      }
    })
    // Persistir los cambios si hubo algún item modificado
    if (itemsChanged) {
      await writeSales(sales)
    }
    enrichedSales.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return NextResponse.json(enrichedSales)
  } catch (error) {
    console.error('Error al obtener ventas:', error)
    return NextResponse.json(
      { error: 'Error al obtener ventas' },
      { status: 500 }
    )
  }
}

// POST create sale
export async function POST(request: Request) {
  try {
    const json = await request.json()
    if (!json.clientId) {
      return NextResponse.json(
        { error: 'Debe seleccionar un cliente para la venta.' },
        { status: 400 }
      )
    }
    const sales = await readSales()
    const now = new Date().toISOString()
    // Calcular el total si no viene
    let total = json.total
    if (!total && Array.isArray(json.products)) {
      total = json.products.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
    }
    // Asegurar que cada item tenga un id único
    let items = Array.isArray(json.products) ? json.products.map((item: any) => ({
      ...item,
      id: item.id || randomUUID()
    })) : []
    const newSale = {
      id: randomUUID(),
      clientId: json.clientId,
      products: items,
      total: total || 0,
      date: now,
      notes: json.notes || '',
      createdAt: now,
      updatedAt: now
    }
    sales.push(newSale)
    await writeSales(sales)

    // --- AJUSTE DE STOCK POR VENTA ---
    // Leer productos
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    let products: any[] = []
    try {
      const productsRaw = await fs.readFile(productsPath, 'utf-8')
      products = JSON.parse(productsRaw)
    } catch (err) {
      products = []
    }
    // Restar stock
    for (const item of items) {
      const prod = products.find((p: any) => p.id === item.productId)
      if (prod && typeof item.quantity === 'number') {
        prod.stock = Math.max(0, (prod.stock || 0) - item.quantity)
        prod.updatedAt = new Date().toISOString()
      }
    }
    // Guardar productos
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf-8')
    // --- FIN AJUSTE DE STOCK ---

    return NextResponse.json(newSale)
  } catch (error) {
    console.error('Error al crear venta:', error)
    return NextResponse.json(
      { error: 'Error al crear venta' },
      { status: 500 }
    )
  }
}

