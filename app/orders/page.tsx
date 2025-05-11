'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useOrders } from "@/hooks/use-orders"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog"
import { DialogFooter, DialogHeader } from "@/components/ui/dialog"

// Extiende el tipo Order para incluir deletedAt opcional
interface OrderWithDeletedAt {
  id: string
  customer?: { name?: string }
  status?: string
  items?: Array<{ id: string; quantity: number; price: number; product: { name: string } }>
  total: number
  createdAt: string
  deletedAt?: string
}

export default function Orders() {
  const { getOrders, isLoading } = useOrders()
  const [orders, setOrders] = useState<OrderWithDeletedAt[]>([])
  const [deleting, setDeleting] = useState(false)
  const [dialogOrderId, setDialogOrderId] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    }
    loadOrders()
  }, [getOrders])

  // Eliminar una venta por id
  async function handleDeleteOrder(orderId: string) {
    setDeleting(true)
    try {
      await fetch('/api/sales', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [orderId] })
      })
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, deletedAt: new Date().toISOString() } : o))
    } catch (e) {
      alert('Error eliminando venta')
    } finally {
      setDeleting(false)
      setDialogOrderId(null)
      setOpenDialog(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Ventas" backUrl="/" />

      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <Link href="/orders/new">
            <Badge className="bg-amber-500 hover:bg-amber-600 px-3 py-1 text-base cursor-pointer">
              Nueva Venta
            </Badge>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground">Cargando ventas...</div>
        ) : orders.filter(o => !o.deletedAt).length === 0 ? (
          <div className="text-center text-muted-foreground">No hay ventas registradas</div>
        ) : (
          <>
            {dialogOrderId && (
              <div className="mb-3 flex gap-2">
                <button className="bg-red-500 text-white px-4 py-1 rounded disabled:opacity-60" onClick={() => setOpenDialog(true)} disabled={deleting}>
                  Eliminar seleccionadas
                </button>
                <span className="text-sm text-muted-foreground">{dialogOrderId} seleccionada(s)</span>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-16">
              {orders.filter(o => !o.deletedAt).map((order) => (
                <div key={order.id} className="relative group">
                  {/* Menú de 3 puntos */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute right-2 top-2 z-10 p-1 rounded hover:bg-stone-200">
                        <span style={{ fontSize: 20, fontWeight: 'bold' }}>⋮</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setDialogOrderId(order.id);
                        setOpenDialog(true);
                      }} className="text-red-600">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href={`/orders/${order.id}`}
                    className="block">
                    <Card className="overflow-hidden bg-background border-stone-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-lg">{order.customer?.name || "Cliente desconocido"}</h3>
                          <Badge variant={order.status === "pending" ? "outline" : "default"}>
                            {order.status === "pending" ? "Pendiente" : "Completada"}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {Array.isArray(order.items) && order.items.length > 0
                            ? order.items.map((item) => (
                              <div key={item.id} className="flex justify-between">
                                <div className="flex">
                                  <span className="mr-2">{item.quantity} ×</span>
                                  <span>{item.product.name}</span>
                                </div>
                                <span className="text-stone-500">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            )) : <div>Sin items</div>}
                        </div>
                        <div className="mt-3 pt-2 border-t flex justify-between items-center">
                          <span className="text-xs text-stone-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main >
      {openDialog && dialogOrderId &&
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-xs mx-auto rounded-lg p-6 text-center">
            <DialogHeader>
              <DialogTitle>Eliminar venta</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de eliminar la venta de <b>{orders.find(o => o.id === dialogOrderId)?.customer?.name || 'Cliente desconocido'}</b>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-center mt-4">
              <DialogClose className="bg-amber-500 text-white px-4 py-1 rounded" onClick={() => { setDialogOrderId(null); setOpenDialog(false); }}>Cancelar</DialogClose>
              <button className="bg-red-500 text-white px-4 py-1 rounded" disabled={deleting} onClick={() => handleDeleteOrder(dialogOrderId)}>Eliminar</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}

    </div >
  )
}
