'use client'

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts, Product } from "@/hooks/use-products";
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';

export default function InventoryTable({ search }: { search: string }) {
  const { getProducts, isLoading } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stockInputs, setStockInputs] = useState<{ [id: string]: number }>({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const filterProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
      }
    };

    fetchProducts();
  }, [getProducts]);

  async function handleStockChange(productId: string, delta: number) {
    if (!delta) return;
    setLoadingIds((prev) => [...prev, productId]);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockDelta: delta })
      });
      if (!res.ok) throw new Error('Error al actualizar stock');
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, stock: updated.stock } : p
        )
      );
    } catch (e) {
      alert('Error al actualizar stock');
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== productId));
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-4">Cargando productos...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">{error}</div>
    );
  }

  const columnsNames = [
    'Producto',
    'Precio',
    'Stock Actual',
    'Modificar stock'
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columnsNames.map((name) => (
            <TableHead key={name}>{name}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {products && products.length >= 0 ? (
          <TableRow>
            <TableCell colSpan={columnsNames.length + 1} className="text-center">No hay productos</TableCell>
          </TableRow>
        ) : (
          filterProducts.map((product) => (
            <TableRow
              key={product.id}
              className={
                product.stock < 10
                  ? 'bg-red-100 dark:bg-red-900/70'
                  : ''
              }
            >
              <TableCell className={product.stock < 10 ? 'text-red-500 font-medium' : ''}>{product.name}</TableCell>
              <TableCell>{typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : (Number(product.price) ? `$${Number(product.price).toFixed(2)}` : 'N/A')}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <div className="flex gap-2 items-center">
                  {/* Control de stock */}
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                    onClick={async () => await handleStockChange(product.id, -Math.abs(stockInputs[product.id] || 1))}
                    title="Restar stock"
                  >-
                  </button>
                  <input
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="w-14 p-1 border border-border rounded bg-background text-foreground text-xs focus:outline-none"
                    onChange={e => setStockInputs((prev) => ({ ...prev, [product.id]: Number(e.target.value) }))}
                  />
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                    onClick={async () => await handleStockChange(product.id, +Math.abs(stockInputs[product.id] || 1))}
                    title="Sumar stock"
                  >+
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}