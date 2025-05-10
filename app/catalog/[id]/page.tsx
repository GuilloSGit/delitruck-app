"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PencilIcon } from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

import Navbar from '@/components/navbar'
import { UploadCloudIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function CatalogProductDetail() {
  // Get product id from URL params
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    imageUrl: "",
    image: null as File | null,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id) return
    fetch(`/api/products/${id}`)
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        setProduct(data)
        setForm({
          name: data.name,
          price: String(data.price ?? ''),
          description: data.description,
          imageUrl: data.imageUrl,
          image: null,
        })
        setPreview(data.imageUrl)
      })
      .catch(() => setError("Producto no encontrado"))
  }, [id])

  const handleEdit = () => setEditMode(true)
  const handleCancel = () => {
    setEditMode(false)
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      image: null,
    })
    setPreview(product.imageUrl)
    setError("")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, image: file }))
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(product?.imageUrl || null)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError("")
    // Validación del precio
    const parsedPrice = parseFloat(String(form.price).replace(',', '.'))
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Por favor ingresa un precio válido (decimal, mayor o igual a 0).')
      setLoading(false)
      return
    }
    try {
      const data = new FormData()
      data.append("name", form.name)
      data.append("price", String(parsedPrice))
      data.append("description", form.description)
      if (form.image) data.append("image", form.image)
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        body: data,
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Error al guardar")
      }
      const updated = await res.json()
      setProduct(updated)
      setEditMode(false)
      setForm({
        name: updated.name,
        price: String(updated.price ?? ''),
        description: updated.description,
        imageUrl: updated.imageUrl,
        image: null,
      })
      setPreview(updated.imageUrl)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>
  }
  if (!product) {
    return <div className="p-8 text-center">Cargando...</div>
  }

  return (
    <div className="w-full min-h-screen bg-background transition-colors duration-300">
      <Navbar title="Producto" backUrl="/catalog" />
      <main className="container w-full">
        <div className="max-w-xl mx-auto bg-white dark:bg-stone-900 rounded-xl shadow-lg dark:border-stone-700">
          {/* Product header and edit button */}
          <div className="flex flex-col w-full gap-2 p-4">
            <label htmlFor="name" className="block text-xs text-foreground text-stone-700 dark:text-stone-100 mr-2">Nombre</label>
            {editMode ? (
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                className="flex-1 bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            ) : (
              <div className="flex items-center justify-between -mt-2">
                <span className="text-lg font-semibold text-stone-900 dark:text-stone-100 flex-1 flex-wrap">{product.name}</span>
                <button
                  onClick={handleEdit}
                  title="Editar"
                  className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                  aria-label="Editar producto"
                >
                  <PencilIcon className="w-5 h-5 text-amber-600 dark:text-amber-300" />
                </button>
              </div>
            )}


            {/* Product image and upload */}
            <div className="my-6 flex flex-col w-full">
              <label htmlFor="image" className="block text-xs text-foreground text-stone-700 dark:text-stone-100 mr-2">Imagen del producto</label>
              {preview ? (
                <Image
                  src={preview}
                  alt={form.name}
                  width={220}
                  height={220}
                  aria-label={form.name}
                  className="rounded-xl shadow-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                />
              ) : (
                <div className="w-[220px] h-[220px] flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-400 dark:text-stone-600 border border-dashed border-stone-300 dark:border-stone-700">
                  Sin imagen
                </div>
              )}
              {editMode && (
                <div className="mt-3 flex flex-col gap-2">
                <label htmlFor="image" className="block text-xs text-foreground text-stone-700 dark:text-stone-100 mr-2">
                  Editar imagen del producto
                </label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="image"
                    className="flex items-center bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded cursor-pointer transition-colors text-sm whitespace-nowrap"
                    style={{ minHeight: 40 }} // Más alto
                  >
                    Elegir imagen
                    <UploadCloudIcon className="w-4 h-4 ml-2" />
                  </label>
                  <span className="text-xs text-foreground">
                    {form.image?.name || "No eligió imagen aún"}
                  </span>
                  <input
                    id="image"
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                </div>
              </div>
              )}
            </div>

            {/* Product price */}
            <div className="my-4 w-full">
              <label htmlFor="price" className="block text-xs text-foreground text-stone-700 dark:text-stone-100 mr-2">Precio</label>
              {editMode ? (
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              ) : (
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">${product.price}</span>
              )}
            </div>

            {/* Product description */}
            <div className="my-4 w-full">
              <label htmlFor="description" className="block text-xs text-foreground text-stone-700 dark:text-stone-100 mr-2">Descripción (opcional)</label>
              {editMode ? (
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              ) : (
                <div className="flex flex-row items-center justify-between gap-2">
                  <span className="text-foreground whitespace-pre-line">{product.description || "N/A"}</span>
                  {/* stock existente */}
                  {product.stock && (
                    <Badge className="bg-slate-100 hover:bg-slate-200">
                      Stock: {product.stock}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Edit mode action buttons */}
            {editMode && (
              <div className="flex gap-2 justify-end my-6 mb-12">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="border-stone-300 dark:border-stone-700 text-foreground hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-800 text-white"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )

}
