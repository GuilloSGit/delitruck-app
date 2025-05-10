"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImagePlus } from "lucide-react"
import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"

import { ThemeProvider } from '@/components/theme-provider'

export default function NewProduct() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [stock, setStock] = useState(1)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const parsedPrice = parseFloat(price.replace(',', '.'))
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Por favor ingresa un precio válido (decimal, mayor o igual a 0).')
      return
    }
    try {
      const data = new FormData()
      data.append('name', name)
      data.append('price', String(parsedPrice))
      if (image) {
        data.append('image', image)
      }
      data.append('stock', String(stock))
      const res = await fetch('/api/products', {
        method: 'POST',
        body: data,
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al guardar el producto')
      }
      setName("")
      setPrice("")
      setImage(null)
      setPreview(null)
      router.push("/catalog")
      router.refresh()
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto')
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-amber-300 dark:bg-neutral-900">
        <Navbar title="Nuevo Producto" backUrl="/catalog" />

        <main className="container mx-auto p-4 max-w-md">
          <Card className="bg-amber-50 dark:bg-neutral-800 border-stone-300 dark:border-neutral-700">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="image" className="block text-lg font-medium">
                  Imagen
                </Label>
                <div
                  className="border-2 border-dashed border-stone-300 dark:border-neutral-600 rounded-lg p-4 text-center cursor-pointer bg-white dark:bg-neutral-900"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {preview ? (
                    <div className="flex justify-center">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="h-40 w-40 object-cover rounded-md bg-white dark:bg-neutral-800"
                      />
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center">
                      <ImagePlus className="h-12 w-12 text-stone-400 dark:text-neutral-500 mb-2" />
                      <p className="text-stone-500 dark:text-neutral-400">Haz clic para subir una imagen</p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                Guardar Producto
              </Button>
            {error && (
              <div className="text-red-600 text-center text-sm pb-2">{error}</div>
            )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
    </ThemeProvider>
  )
}
