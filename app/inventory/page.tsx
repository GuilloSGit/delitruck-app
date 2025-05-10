'use client'

import { Suspense } from "react";
import Nav from "@/components/navbar";
import InventoryTable from "@/components/custom/inventory-table"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { useState } from "react"


export default function InventoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-12">
      <Nav title="Inventario" backUrl="/" />
      
      <main className="flex-1 container mx-auto p-4">
        <Suspense fallback={<div>Cargando...</div>}>
          <InventoryContent />
        </Suspense>
      </main>
    </div>
  );
}

function InventoryContent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Control de Stock</h2>
      <div className="bg-background rounded-md shadow overflow-hidden">
        <div className="p-4 flex items-center">
          {/* search */}
          <Input
            placeholder="Buscar producto..."
            className="flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <InventoryTable search={debouncedSearch} />
        </div>
      </div>
    </div>
  );
}