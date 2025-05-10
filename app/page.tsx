'use client'

import Image from "next/image"
import Link from "next/link"
import InventoryBadge from "@/components/custom/inventory-badge"
import { useLowStockCount } from "@/hooks/use-low-stock"
import { useProducts } from "@/hooks/use-products"
import { UsersIcon, ChartNetworkIcon, BookIcon, StoreIcon } from "lucide-react"
import { useBusinessName } from "@/hooks/use-business-name"

export default function Home() {
  const businessName = useBusinessName()
  const { products } = useProducts()
  return (
    <main className="flex min-h-screen flex-col items-center justify-around bg-background p-4 pb-16 md:pb-4"> {/* Use bg-background for theme-aware background color */}
      <div className="w-full max-w-md flex flex-col justify-between items-center gap-6 pt-8">
        <div className="flex items-center gap-3">
          <Image src="/truck-logo.svg" alt={businessName + " Logo"} width={60} height={60} className="w-16 h-16" />
          <h1 className="text-4xl font-bold text-foreground">{businessName}</h1> {/* Use text-foreground for theme-aware text color */}
        </div>

        <div className="w-full flex flex-col gap-3 mt-6">
          <Link
            href="/orders/new"
            className="w-full flex items-center justify-center bg-background hover:bg-muted text-foreground font-semibold py-3 px-4 rounded-md border border-stone-300 text-center"
          >
            <ChartNetworkIcon className="w-4 h-4 mr-2" />
            NUEVA VENTA
          </Link>
          <Link
            href="/orders"
            className="w-full flex items-center justify-center bg-background hover:bg-muted text-foreground font-semibold py-3 px-4 rounded-md border border-stone-300 text-center"
          >
            <ChartNetworkIcon className="w-4 h-4 mr-2" />
            VENTAS
          </Link>
          <Link
            href="/catalog"
            className="w-full flex items-center justify-center bg-background hover:bg-muted text-foreground font-semibold py-3 px-4 rounded-md border border-stone-300 text-center"
          >
            <BookIcon className="w-4 h-4 mr-2" />
            CATÁLOGO
          </Link>
          <Link
            href="/customers"
            className="w-full flex items-center justify-center bg-background hover:bg-muted text-foreground font-semibold py-3 px-4 rounded-md border border-stone-300 text-center"
          >
            <UsersIcon className="w-4 h-4 mr-2" />
            CLIENTES
          </Link>
          <Link
            href="/inventory"
            className="w-full flex items-center justify-center bg-background hover:bg-muted text-foreground font-semibold py-3 px-4 rounded-md border border-stone-300 text-center flex items-center justify-center"
          >
            <StoreIcon className="w-4 h-4 mr-2" />
            INVENTARIO
            <InventoryBadge lowStockCount={useLowStockCount(10, products)} />
          </Link>
        </div>
      </div>
    </main>
  )
}
