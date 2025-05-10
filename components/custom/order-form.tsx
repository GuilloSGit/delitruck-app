'use client'

import { useState } from "react"
import { useCustomers } from "@/hooks/use-customers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface OrderFormProps {
  onSubmit: (data: {
    customerId: string
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    notes?: string
  }) => void
  onCancel: () => void
  products: Product[]
}

export function OrderForm({ onSubmit, onCancel, products }: OrderFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [items, setItems] = useState<Array<{
    productId: string
    quantity: number
    price: number
  }>>([])
  const [notes, setNotes] = useState("")
  const debouncedSearch = useDebounce(customerSearch)
  const { customers, isLoading } = useCustomers(debouncedSearch)

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return

    setItems(prev => {
      const existingItem = prev.find(item => item.productId === productId)
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId, quantity: 1, price: product.price }]
    })
  }

  const handleRemoveItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId))
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId)
    if (!product || quantity < 1 || quantity > product.stock) return

    setItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const total = items.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId)
    return acc + (product ? product.price * item.quantity : 0)
  }, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId || items.length === 0) return

    onSubmit({
      customerId: selectedCustomerId,
      items,
      notes: notes || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Búsqueda de Cliente */}
      <div className="space-y-2">
        <Label className="text-gray-700 font-semibold">Cliente</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar cliente..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Lista de Clientes */}
        {debouncedSearch && (
          <div className="mt-2 space-y-2">
            {isLoading ? (
              <p className="text-sm text-gray-500">Buscando...</p>
            ) : customers?.length > 0 ? (
              customers.map(customer => (
                <div
                  key={customer.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    selectedCustomerId === customer.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCustomerId(customer.id)}
                >
                  <div className="font-medium">{customer.name}</div>
                  {customer.email && (
                    <div className="text-sm text-gray-600">{customer.email}</div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No se encontraron clientes</p>
            )}
          </div>
        )}
      </div>

      {/* Lista de Productos */}
      <div className="space-y-2">
        <Label className="text-gray-700 font-semibold">Productos</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {products.map(product => (
            <div
              key={product.id}
              className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => handleAddItem(product.id)}
            >
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-gray-600">
                {formatCurrency(product.price)}
              </div>
              <div className="text-sm text-gray-500">
                Stock: {product.stock}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items Seleccionados */}
      {items.length > 0 && (
        <div className="space-y-2">
          <Label>Items Seleccionados</Label>
          <div className="space-y-2">
            {items.map(item => {
              const product = products.find(p => p.id === item.productId)
              if (!product) return null

              return (
                <div key={item.productId} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(product.price)} c/u
                    </div>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={product.stock}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    Eliminar
                  </Button>
                </div>
              )
            })}
          </div>
          <div className="text-right font-bold">
            Total: {formatCurrency(total)}
          </div>
        </div>
      )}

      {/* Notas */}
      <div className="space-y-2">
        <Label className="text-gray-700 dark:text-gray-300 font-semibold">Notas (opcional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Agregar notas o comentarios..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!selectedCustomerId || items.length === 0}
        >
          Crear Venta
        </Button>
      </div>
    </form>
  )
}
