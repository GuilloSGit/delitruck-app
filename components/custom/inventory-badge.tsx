import React from "react"

interface InventoryBadgeProps {
  lowStockCount: number
}

// Simple badge with red background if there are low stock products
export default function InventoryBadge({ lowStockCount }: InventoryBadgeProps) {
  if (lowStockCount <= 0) return null
  return (
    <span
      className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-bounce-custom"
      style={{
        animation: 'bounce-custom 0.7s infinite',
      }}
    >
      {lowStockCount}
      <style>{`
        @keyframes bounce-custom {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-3px); }
          60% { transform: translateY(0); }
        }
      `}</style>
    </span>
  )
}
