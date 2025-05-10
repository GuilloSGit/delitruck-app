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
// GET product by id
export async function GET(request: Request, context: { params: { id: string } }) {
  const { params } = context;
  const { id } = await params;
  try {
    let products = await readProducts();
    const product = products.find((p: any) => p.id === id);
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    );
  }
}

// PATCH update product by id
export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { params } = context;
  const { id } = await params;
  try {
    let products = await readProducts();
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    if (contentType.includes('application/json')) {
      data = await request.json();
      if (typeof data.stockDelta !== 'undefined') {
        const delta = Number(data.stockDelta);
        if (!isNaN(delta)) {
          const product = products.find((p: any) => p.id === id);
          if (product) {
            product.stock = Math.max(0, (product.stock || 0) + delta);
            await writeProducts(products);
            return NextResponse.json(product);
          }
        }
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      let imageUrl = undefined;
      for (const [key, value] of formData.entries()) {
        if (key === 'image' && value instanceof File && value.size > 0) {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          try {
            await fs.mkdir(uploadDir, { recursive: true });
          } catch (e) {}
          const arrBuf = await value.arrayBuffer();
          const buffer = Buffer.from(arrBuf);
          let ext = 'png';
          const mimeType = value.type;
          if (mimeType && mimeType.startsWith('image/')) {
            ext = mimeType.split('/')[1];
          }
          // Elimina imagen anterior si existe
          const oldProduct = products.find((p: any) => p.id === id);
          if (oldProduct && oldProduct.imageUrl) {
            const oldPath = path.join(process.cwd(), 'public', oldProduct.imageUrl);
            try { await fs.unlink(oldPath); } catch {}
          }
          const filename = `${id}_${randomUUID()}.${ext}`;
          const filepath = path.join(uploadDir, filename);
          await fs.writeFile(filepath, buffer);
          imageUrl = `/uploads/${filename}`;
        } else if (key !== 'image') {
          data[key] = value;
        }
      }
      if (imageUrl) {
        data.imageUrl = imageUrl;
      }
    }

    let idx = products.findIndex((p: any) => p.id === id);
    if (idx === -1) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    // Solo actualiza los campos presentes
    products[idx] = {
      ...products[idx],
      ...Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      ),
      updatedAt: new Date().toISOString()
    };
    await writeProducts(products);
    return NextResponse.json(products[idx]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

// DELETE product by id
export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { params } = context;
  const { id } = await params;
  try {
    let products = await readProducts();
    const idx = products.findIndex((p: any) => p.id === id); 
    if (idx === -1) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    const deleted = products.splice(idx, 1)[0];
    await writeProducts(products);
    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}