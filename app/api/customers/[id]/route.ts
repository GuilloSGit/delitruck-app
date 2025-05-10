import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data', 'clients.json')

async function readClients() {
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

async function writeClients(clients: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(clients, null, 2), 'utf-8')
}

// GET client by id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clients = await readClients()
    const client = clients.find((c: any) => c.id === params.id)
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error al obtener cliente:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

// PUT update client by id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const json = await request.json()
    const clients = await readClients()
    const idx = clients.findIndex((c: any) => c.id === params.id)
    if (idx === -1) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    clients[idx] = {
      ...clients[idx],
      ...json,
      updatedAt: new Date().toISOString()
    }
    await writeClients(clients)
    return NextResponse.json(clients[idx])
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE client by id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clients = await readClients()
    const idx = clients.findIndex((c: any) => c.id === params.id)
    if (idx === -1) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    const deleted = clients.splice(idx, 1)[0]
    await writeClients(clients)
    return NextResponse.json({ message: 'Cliente eliminado', client: deleted })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}
