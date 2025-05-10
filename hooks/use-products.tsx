'use client'

import { useState, useCallback } from 'react'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  stock: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductData {
  name: string
  description?: string
  price: number
  imageUrl?: string
  stock: number
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/products')
      
      if (!response.ok) {
        throw new Error('Error al obtener productos')
      }

      const products = await response.json()
      setProducts(products)
      return products
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getProduct = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/products/${id}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener el producto')
      }

      const product = await response.json()
      setProducts(prev => {
        // Si ya existe un producto con este id, reemplázalo (updateProduct)
        const idx = prev.findIndex(p => p.id === (product.id as string))
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = product
          return copy
        }
        // Si no existe, agrégalo (createProduct)
        return [...prev, product]
      })
      return product
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createProduct = useCallback(async (data: CreateProductData) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error al crear el producto')
      }

      const product = await response.json()
      setProducts(prev => {
        // Si ya existe un producto con este id, reemplázalo (updateProduct)
        const idx = prev.findIndex(p => p.id === (product.id as string))
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = product
          return copy
        }
        // Si no existe, agrégalo (createProduct)
        return [...prev, product]
      })
      return product
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProduct = useCallback(async (id: string, data: UpdateProductData) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el producto')
      }

      const product = await response.json()
      setProducts(prev => {
        // Si ya existe un producto con este id, reemplázalo (updateProduct)
        const idx = prev.findIndex(p => p.id === (product.id as string))
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = product
          return copy
        }
        // Si no existe, agrégalo (createProduct)
        return [...prev, product]
      })
      return product
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el producto')
      }

      setProducts(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const adjustStock = useCallback(async (id: string, quantity: number, description: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/products/${id}/stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, description }),
      })

      if (!response.ok) {
        throw new Error('Error al ajustar el stock')
      }

      const product = await response.json()
      setProducts(prev => {
        // Si ya existe un producto con este id, reemplázalo (updateProduct)
        const idx = prev.findIndex(p => p.id === (product.id as string))
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = product
          return copy
        }
        // Si no existe, agrégalo (createProduct)
        return [...prev, product]
      })
      return product
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    products,
    isLoading,
    error,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  }
}