import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

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

// GET all clients
export async function GET() {
  try {
    const clients = await readClients()
    clients.sort((a: any, b: any) => a.name.localeCompare(b.name))
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

// POST create client
export async function POST(request: Request) {
  try {
    const json = await request.json()
    const clients = await readClients()
    const now = new Date().toISOString()
    const newClient = {
      id: randomUUID(),
      name: json.name,
      email: json.email,
      phone: json.phone,
      address: json.address,
      createdAt: now,
      updatedAt: now
    }
    clients.push(newClient)
    await writeClients(clients)
    return NextResponse.json(newClient)
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}
