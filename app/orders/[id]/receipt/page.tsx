"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useParams, useRouter } from "next/navigation"
import { Printer } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Order, OrderItem, useOrders } from "@/hooks/use-orders"
import Image from "next/image"
import { useBusinessName } from "@/hooks/use-business-name"

export default function Receipt() {
  const businessName = useBusinessName()
  const params = useParams()
  const router = useRouter()
  const receiptRef = useRef<HTMLDivElement>(null)

  const orderId = params.id as string
  const { getOrder } = useOrders()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getOrder(orderId)
      .then((o) => { if (mounted) setOrder(o) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [orderId, getOrder])

  if (loading) return <div>Cargando...</div>
  if (!order) return <div>Pedido no encontrado</div>

  const calculateSubtotal = (price: number, quantity: number) => {
    return price * quantity
  }

  const calculateTotal = (order: Order) => {
    return order.items.reduce((sum: number, item: OrderItem) => sum + calculateSubtotal(item.price, item.quantity), 0)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="mb-4 flex gap-2 print:hidden w-full max-w-md">
        <Button variant="outline" onClick={handleBack} className="flex-1">
          Volver
        </Button>
        <Button onClick={handlePrint} className="flex-1 bg-amber-500 hover:bg-amber-600">
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
      </div>

      <Card className="w-full max-w-md bg-white" ref={receiptRef}>
        <div className="border-b-2 border-dashed border-gray-300 pb-4 mb-1">
          <div className="text-center mb-2">
            <Image src="/logo.png" alt={businessName + " Logo"} width={50} height={50} />
            <h1 className="text-2xl font-bold">{businessName}</h1>
            <p className="text-xl uppercase font-bold">RECIBO</p>
          </div>

          <div className="mb-4">
            <p className="font-medium">{order.customer.name}</p>
          </div>

          <div className="text-sm">
            <p>Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Hora: {new Date(order.createdAt).toLocaleTimeString()}</p>
            <p>Pedido #: {orderId}</p>
          </div>
        </div>

        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2">Producto</th>
                <th className="text-center py-2">Cant.</th>
                <th className="text-right py-2">Precio</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{item.product?.name ?? '[Producto eliminado]'}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">${item.price.toFixed(2)}</td>
                  <td className="text-right py-2">${calculateSubtotal(item.price, item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-dashed border-gray-300 pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${calculateTotal(order).toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-2 text-center text-sm">
          <p>¡Gracias por su compra!</p>
          <p>{businessName} - Servicio de Delivery</p>
        </div>
      </Card>
    </div>
  )
}
