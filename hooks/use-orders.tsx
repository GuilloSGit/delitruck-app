'use client'

import { useState, useCallback } from 'react'

export interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    name: string
    description: string | null
  }
}

export interface Order {
  id: string
  customerId: string
  customer: {
    name: string
    email: string | null
    phone: string | null
    address: string | null
  }
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  notes: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface CreateOrderData {
  clientId: string
  products: Array<{
    productId: string
    quantity: number
    price: number
  }>
  notes?: string
}

export const useOrders = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = useCallback(async (data: CreateOrderData) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error al crear la venta')
      }

      const order = await response.json()
      return order
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getOrder = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/orders/${id}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener la venta')
      }

      const order = await response.json()
      return order
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        throw new Error('Error al obtener las ventas')
      }

      const orders = await response.json()
      return orders
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la venta')
      }

      const order = await response.json()
      return order
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    createOrder,
    getOrder,
    getOrders,
    updateOrderStatus,
  }
}
