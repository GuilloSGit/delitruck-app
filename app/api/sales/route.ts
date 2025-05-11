// API para ventas usando Firebase
import { NextResponse } from 'next/server'
import { db } from '@/firebase'
import { ref, get, set, update } from 'firebase/database'
import { randomUUID } from 'crypto'

async function readSales() {
  const snapshot = await get(ref(db, 'sales'));
  if (!snapshot.exists()) return [];

  const sales = Object.values(snapshot.val()) as any[];
  const validSales = [];
  for (const sale of sales) {
    // Normaliza: si tiene 'products' pero no 'items', conviértelo
    if (!Array.isArray(sale.items) && Array.isArray(sale.products)) {
      sale.items = sale.products.map((p: any, idx: any) => ({
        id: p.id || `${sale.id}-item-${idx}`,
        productId: p.productId,
        quantity: p.quantity,
        price: p.price,
        product: p.product // por si ya está expandido
      }));
    }
    if (!Array.isArray(sale.items)) {
      sale.items = [];
    } else {
      // Solo items con productId válido
      sale.items = await Promise.all(
        sale.items
          .filter((item: any) => item && item.productId)
          .map(async (item: any) => {
            if (!item.product && item.productId) {
              const prodSnap = await get(ref(db, `products/${item.productId}`));
              item.product = prodSnap.exists() ? prodSnap.val() : null;
            }
            return item;
          })
      );
    }
    // Solo ventas con al menos 1 item con producto válido
    sale.items = sale.items.filter((item: any) => item.product);
    sale.total = sale.items.reduce(
      (sum: any, item: any) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    if (sale.items.length > 0) {
      validSales.push(sale);
    }
  }
  return validSales;
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

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const ids: string[] = Array.isArray(body.ids) ? body.ids : []
    if (!ids.length) {
      return NextResponse.json({ error: 'Debes enviar un array de ids' }, { status: 400 })
    }
    const now = new Date().toISOString()
    // Soft delete: marcar cada venta con deletedAt
    const updates: Record<string, any> = {}
    for (const id of ids) {
      updates[`sales/${id}/deletedAt`] = now
    }
    await update(ref(db), updates)
    return NextResponse.json({ ok: true, deleted: ids })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar ventas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const now = new Date().toISOString()
    // Obtener cliente completo
    let customer = null
    if (body.clientId) {
      const clientSnap = await get(ref(db, `clients/${body.clientId}`))
      if (clientSnap.exists()) {
        customer = clientSnap.val()
      }
    }
    // Obtener productos completos para cada item
    let items = []
    if (Array.isArray(body.items)) {
      items = await Promise.all(body.items.map(async (item: any) => {
        let product = null
        if (item.productId) {
          const prodSnap = await get(ref(db, `products/${item.productId}`))
          if (prodSnap.exists()) {
            product = prodSnap.val()
          }
        }
        return {
          ...item,
          product
        }
      }))
    }
    const newSale = {
      ...body,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      customer,
      items
    }
    await set(ref(db, `sales/${newSale.id}`), newSale)
    return NextResponse.json(newSale)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear venta' }, { status: 500 })
  }
}
