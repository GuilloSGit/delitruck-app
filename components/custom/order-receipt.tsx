'use client'

import { Order } from "@/hooks/use-orders"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import { useRef, useEffect } from "react"
import {toPng} from 'html-to-image'
import { DownloadIcon, Printer } from "lucide-react"
import { useBusinessName } from "@/hooks/use-business-name"

interface OrderReceiptProps {
  order: Order
  tipo?: 'recibo' | 'remito'
}


export function OrderReceipt({ order, tipo = 'recibo' }: OrderReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const businessName = useBusinessName()
  const id = order.id.slice(-6).padStart(6, '0')
  const customerName = order.customer?.name || 'Sin cliente'

  useEffect(() => {
    const prevTitle = document.title
    const nombre = tipo === 'recibo' ? `${customerName}-Recibo-${id}` : `${customerName}-Remito-${id}`
    document.title = nombre
    return () => {
      document.title = prevTitle
    }
  }, [order.id, tipo])

  const downloadReceiptImage = async () => {
    if (receiptRef.current) {
      const dataUrl = await toPng(receiptRef.current)
      const link = document.createElement('a')
      link.download = `${customerName}-${tipo === 'recibo' ? 'Recibo' : 'Remito'}-${id}.png`
      link.href = dataUrl
      link.click()
    }
  }

  const printReceipt = () => {
    window.print()
  }

  const numero = order.id.slice(-6).padStart(6, '0')
  return (
    <div className="w-full bg-background text-foreground overflow-y-auto">
      {/* Botón de imprimir nativo */}
      <div ref={receiptRef} className="receipt-print bg-card dark:bg-zinc-900 p-2 sm:p-6 rounded-md sm:rounded-lg shadow print:shadow-none mt-2 sm:mt-4 text-foreground border border-border">
        {/* Encabezado */}
        <div className="flex flex-row sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-2">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2 text-2xl sm:text-3xl font-bold">
              <Image src="/truck-logo.svg" alt="Logo" width={40} height={40} />
              <span className="text-amber-500">{businessName}</span>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Teléfono: +54 2657 358805</p>
            </div>
          </div>
          <div className="flex flex-col mt-2">
            <h2 className="text-lg sm:text-xl font-bold">
              {tipo === 'recibo' ? 'Recibo N° ' : 'Remito N° '}
              <span className="text-green-700 dark:text-green-400 font-mono">{numero}</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          {/* Aquí puedes poner el estado o acción */}
        </div>

        {/* Cliente */}
        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Cliente</h3>
          <div className="bg-card dark:bg-zinc-800 p-2 sm:p-3 rounded-md">
            <p className="font-medium text-sm sm:text-base">{customerName}</p>
            {order.customer.email && <p className="text-xs sm:text-sm text-muted-foreground">{order.customer.email}</p>}
            {order.customer.phone && <p className="text-xs sm:text-sm text-muted-foreground">{order.customer.phone}</p>}
          </div>
        </div>

        {/* Productos */}
        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2">Productos</h3>
          <div className="bg-card dark:bg-zinc-800 p-2 sm:p-3 rounded-md overflow-auto">
            <table className="w-full min-w-[340px] text-xs sm:text-sm">
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
                    <td className="text-right py-2">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right pt-2 font-bold">Total:</td>
                  <td className="text-right pt-2 font-bold">{formatCurrency(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Mensaje de cierre */}
        <div className="my-12">
          <p className="text-center text-xs text-muted-foreground">Gracias por su compra</p>
          <p className="text-center text-xs text-muted-foreground">Teléfono: +54 2657 358805</p>
        </div>
      </div>
      <div className="my-4 sm:mb-6 print:hidden flex gap-2">
        <button
          onClick={printReceipt}
          className={`w-full 1/2 flex items-center justify-center py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm sm:text-base transition-colors ${tipo === 'recibo' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
        >
          <Printer className="w-4 h-4 mr-2" />
          {tipo === 'recibo' ? 'Imprimir Recibo' : 'Imprimir Remito'}
        </button>
        <button
          onClick={async () => {
            await downloadReceiptImage()
          }}
          className={`w-full 1/2 flex items-center justify-center py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm sm:text-base transition-colors bg-green-600 hover:bg-green-700 text-white`}
        >
          <DownloadIcon className="w-4 h-4 mr-2" />
          Descargar
        </button>
      </div>
    </div>
  )
}
