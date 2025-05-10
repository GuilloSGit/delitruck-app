'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Navbar from '@/components/navbar'
import { useRouter } from 'next/navigation'
import { useCustomers } from '@/hooks/use-customers'
import { useOrders } from '@/hooks/use-orders'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function NewOrder() {
  const router = useRouter()
  const { customers, isLoading: isLoadingCustomers } = useCustomers()
  const { createOrder, isLoading: isLoadingOrder } = useOrders()
  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [notes, setNotes] = useState('')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Error al cargar productos')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  const addProduct = () => {
    if (!selectedProductId) return

    const product = products.find((p) => p.id === selectedProductId)
    if (!product) return

    const existingItemIndex = items.findIndex((item) => item.productId === selectedProductId)

    if (existingItemIndex >= 0) {
      const updatedItems = [...items]
      const newQuantity = updatedItems[existingItemIndex].quantity + 1
      if (newQuantity <= product.stock) {
        updatedItems[existingItemIndex].quantity = newQuantity
        setItems(updatedItems)
      }
    } else {
      if (product.stock > 0) {
        setItems([
          ...items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ])
      }
    }

    setSelectedProductId('')
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    const product = products.find((p) => p.id === items[index].productId)
    if (!product || newQuantity < 1 || newQuantity > product.stock) return

    const updatedItems = [...items]
    updatedItems[index].quantity = newQuantity
    setItems(updatedItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!customerId || items.length === 0) return

    try {
      await createOrder({
        clientId: customerId,
        products: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        notes: notes || undefined
      })
      router.push('/orders')
    } catch (error) {
      setErrorMsg('Hubo un problema al crear la venta.')
      console.error('Error creating order:', error)
    }
  }

  const isLoading = isLoadingCustomers || isLoadingProducts || isLoadingOrder

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar title="Nueva Venta" backUrl="/orders" />

      <main className="container mx-auto p-4 max-w-md">
        <Card className="bg-card border border-border">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Cargando...</div>
            ) : (
              <>
                {errorMsg && (
                  <div className="mb-4 text-center text-red-600 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-900 rounded p-2">
                    {errorMsg}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer" className="block text-lg font-medium">
                      Cliente
                    </Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="block text-lg font-medium">Productos</Label>
                    <div className="flex gap-2">
                      <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={product.id}
                              disabled={product.stock === 0}
                            >
                              {product.name} - {formatCurrency(product.price)} {product.stock === 0 && '(Sin stock)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        onClick={addProduct}
                        className="bg-amber-500 hover:bg-amber-600"
                        disabled={!selectedProductId}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {items.length > 0 && (
                      <div className="mt-4 space-y-3 border border-border rounded-md p-3 bg-card dark:bg-zinc-800">
                        {items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId)
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatCurrency(item.price)}
                                  {product && (
                                    <span className="ml-2 text-stone-400">
                                      (Stock: {product.stock})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  disabled={product && item.quantity >= product.stock}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-500"
                                  onClick={() => removeItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}

                        <div className="pt-3 border-t border-border mt-3">
                          <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(calculateTotal())}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="block text-lg font-medium">
                      Notas (opcional)
                    </Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={items.length === 0 || !customerId || isLoadingOrder}
                  >
                    {isLoadingOrder ? 'Creando Venta...' : 'Crear Venta'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
