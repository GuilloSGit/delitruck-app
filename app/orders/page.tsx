'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { useOrders, type Order } from "@/hooks/use-orders"
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"

export default function Orders() {
  const { getOrders, isLoading } = useOrders()
  const [orders, setOrders] = useState<Order[]>([])

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
        ) : orders.length === 0 ? (
          <div className="text-center text-muted-foreground">No hay ventas registradas</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-16">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="overflow-hidden bg-background border-stone-200 hover:shadow-md transition-shadow"> {/* Use bg-background for theme-aware background color */}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">{order.customer?.name || "Cliente desconocido"}</h3>
                      <Badge variant={order.status === "pending" ? "outline" : "default"}>
                        {order.status === "pending" ? "Pendiente" : "Completada"}
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {order.items?.length > 0 ? order.items.map((item) => (
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
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
