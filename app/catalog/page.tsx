'use client'

import React from 'react'

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Plus } from "lucide-react"
import Nav from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { useState } from "react"

// Product type definition
interface Product {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string | null
  stock?: number
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [flagOfEmpty, setFlagOfEmpty] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    setLoading(true)
      try {
        const response = await fetch('/api/products')
        const data = await response.json()
        if(data.length === 0) {
          setFlagOfEmpty(true)
          console.log('No hay productos')
        }
        if(search.length > 0) {
          handleSearch()
        } else {
          setProducts(data)
          setFlagOfEmpty(false)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

  React.useEffect(() => {
    fetchProducts()
  }, [])

  const handleSearch = () => products.filter(p =>
    p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Nav title="Catálogo" backUrl="/" />
      <main className="container mx-auto p-4 max-w-md">
        <div className="flex flex-col">
          {/* Search */}
          <div className="flex items-center mb-4">
            <Input
              placeholder="Buscar producto..."
              className="flex-1"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Link href="/catalog/new">
            <Badge className="bg-amber-500 hover:bg-amber-600">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Badge>
          </Link>
        </div>
        <div className="grid gap-4 mb-12">
          {products.length > 0 ? products.map((product) => (
            <Link key={product.id} href={`/catalog/${product.id}`}>
              <Card className="overflow-hidden bg-background border-stone-300">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="flex-shrink-0 mr-4">
                      <div style={{ width: 80, height: 80 }} className="flex items-center justify-center overflow-hidden rounded-md bg-white dark:bg-neutral-800">
                        <Image
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-md text-foreground">{product.name}</h3>
                      <p className="text-md font-bold text-foreground">{typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : (Number(product.price) ? `$${Number(product.price).toFixed(2)}` : 'N/A')}</p>
                      {/* stock existente */}
                      {product.stock && (
                        <Badge className="bg-slate-100 hover:bg-slate-200">
                          Stock: {product.stock}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )) : (
            <div className="flex justify-center items-center">
              <p className="text-center text-muted-foreground">No hay productos</p>
            </div>
          )}
          {search.length > 0 && !loading && (
            <div className="flex justify-center items-center">
              <p className="text-center text-muted-foreground">No hay productos con el término "{search}"</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center">
              <Loader2 className="ml-2 h-12 w-12 animate-spin" />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
