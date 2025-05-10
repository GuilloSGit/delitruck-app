"use client"
import { useEffect, useState } from "react"
import { Product } from "./use-products"

// Custom hook to get the count of products with stock below the threshold
export function useLowStockCount(threshold: number = 10, products: Product[]) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then((products) => {
        if (Array.isArray(products)) {
          const lowStock = products.filter(
            (p) => typeof p.stock === "number" && p.stock < threshold
          )
          setCount(lowStock.length)
        }
      })
      .catch(() => setCount(0))
  }, [threshold])

  return count
}
