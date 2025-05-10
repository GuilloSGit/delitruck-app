'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/navbar'
import { Printer } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useOrders, type Order } from '@/hooks/use-orders'
import { OrderReceipt } from '@/components/custom/order-receipt'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'

export default function OrderDetail() {
  const params = useParams()
  const { getOrder, updateOrderStatus, isLoading } = useOrders()
  const [order, setOrder] = useState<Order | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await getOrder(params.id as string)
        setOrder(data)
      } catch (error) {
        console.error('Error loading order:', error)
      }
    }
    loadOrder()
  }, [getOrder, params.id])

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-amber-50">
        <Navbar title="Detalle de Venta" backUrl="/orders" />
        <main className="container mx-auto p-4">
          <div className="text-center text-gray-600">Cargando venta...</div>
        </main>
      </div>
    )
  }

  const handleStatusChange = async () => {
    try {
      const newStatus = order.status === 'pending' ? 'completed' : 'pending'
      const updatedOrder = await updateOrderStatus(order.id, newStatus)
      setOrder(updatedOrder)
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar title="Detalle de Venta" backUrl="/orders" />

      <main className="container mx-auto p-4 max-w-2xl">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">
                  {order.status === 'completed' ? (
                    <>
                      Recibo N° <span className="text-green-700 dark:text-green-400 font-mono">{order.id.slice(-6).padStart(6, '0')}</span>
                    </>
                  ) : (
                    <>
                      Remito N° <span className="text-yellow-700 dark:text-yellow-400 font-mono">{order.id.slice(-6).padStart(6, '0')}</span>
                    </>
                  )}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge
                variant={order.status === 'pending' ? 'outline' : 'default'}
                className="cursor-pointer whitespace-nowrap"
                onClick={handleStatusChange}
              >
                {order.status === 'pending' ? 'Marcar como Completada' : 'Marcar como Pendiente'}
              </Badge>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Cliente</h3>
              <div className="bg-card dark:bg-zinc-800 p-3 rounded-md">
                {order.customer ? (
                  <>
                    <p className="font-medium">{order.customer.name}</p>
                    {order.customer.email && <p className="text-sm text-muted-foreground">{order.customer.email}</p>}
                    {order.customer.phone && <p className="text-sm text-muted-foreground">{order.customer.phone}</p>}
                  </>
                ) : (
                  <p className="text-muted-foreground italic">Sin cliente</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Productos</h3>
              <div className="bg-card dark:bg-zinc-800 p-3 rounded-md overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-left pb-2">Producto</th>
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-center pb-2">Cant.</th>
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-right pb-2">Precio</th>
                      <th className="text-gray-700 dark:text-gray-200 font-semibold text-right pb-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0 border-border">
                        <td className="py-2">{item.product?.name ?? '[Producto eliminado]'}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">{formatCurrency(item.price)}</td>
                        <td className="text-right py-2">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right pt-2 font-bold">
                        Total:
                      </td>
                      <td className="text-right pt-2 font-bold">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {order.notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Notas</h3>
                <div className="bg-card dark:bg-zinc-800 p-3 rounded-md">
                  <p className="text-muted-foreground">{order.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="w-full">
          <DialogDescription className='hidden'>Recibo de Venta</DialogDescription>
          <DialogHeader>
            <DialogTitle>
              {order.status === 'completed' ? 'Recibo' : 'Remito'} {order.status === 'completed'
                ? ' de Venta'
                : ' de Entrega / Pendiente de Pago'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[10px]">
             {order.id.slice(-6).padStart(6, '0')}
            </DialogDescription>
          </DialogHeader>
          <OrderReceipt order={order} tipo={order.status === 'completed' ? 'recibo' : 'remito'} />
        </DialogContent>
      </Dialog>

      {/* Botón fijo para imprimir recibo/remito */}
      <div className="fixed bottom-12 right-6 flex gap-2 z-50">
        <Button
          onClick={() => setShowReceipt(true)}
          className={order.status === 'completed' ? 'bg-orange-400 hover:bg-orange-500' : 'bg-yellow-500 hover:bg-yellow-600'}
        >
          <Printer className="mr-2 h-4 w-4" />
          {order.status === 'completed' ? 'Imprimir Recibo' : 'Imprimir Remito'}
        </Button>
      </div>
    </div>
  )
}

