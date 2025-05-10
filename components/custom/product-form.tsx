'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useProducts, type Product } from '@/hooks/use-products'

interface ProductFormProps {
  initialData?: Product
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const { createProduct, updateProduct, isLoading } = useProducts()
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    stock: initialData?.stock || 0,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Use FormData to send multipart/form-data
      const data = new FormData()
      data.append('name', formData.name)
      data.append('description', formData.description)
      data.append('price', String(formData.price))
      data.append('stock', String(formData.stock))
      if (imageFile) {
        data.append('image', imageFile)
      } else if (initialData && initialData.imageUrl) {
        // Si no se seleccionó nueva imagen, enviar la URL existente para que el backend la conserve
        data.append('imageUrl', initialData.imageUrl)
      }
      let res: Response
      if (initialData) {
        // PATCH para actualizar producto existente
        res = await fetch(`/api/products/${initialData.id}`, {
          method: 'PATCH',
          body: data,
        })
      } else {
        // POST para crear producto nuevo
        res = await fetch('/api/products', {
          method: 'POST',
          body: data,
        })
      }
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al guardar el producto')
      }
      router.push('/products')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    }
  }

  // Handle image file selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre del producto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del producto"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                }
                required
                disabled={!!initialData}
              />
            </div>
          </div>

          {/* Image upload field */}
          <div className="space-y-2">
            <Label htmlFor="image">Foto (opcional)</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="mt-2 max-h-40 rounded border"
              />
            )}
          </div>

          <div className="pt-4 space-x-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isLoading}>
              {isLoading
                ? 'Guardando...'
                : initialData
                ? 'Actualizar Producto'
                : 'Crear Producto'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
