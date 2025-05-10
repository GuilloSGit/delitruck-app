'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Customer } from "@/hooks/use-customers"

interface CustomerFormProps {
  initialData?: Partial<Customer>
  onSubmit: (data: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>
  onCancel: () => void
}

export function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    location: { lat: initialData?.location?.lat || 0, lng: initialData?.location?.lng || 0}
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customer-name">Nombre</Label>
        <Input
          id="customer-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-email">Email</Label>
        <Input
          id="customer-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-phone">Teléfono</Label>
        <Input
          id="customer-phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customer-address">Dirección</Label>
        <Input
          id="customer-address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1 1/2">
          <label htmlFor="customer-lat" className="block text-xs mb-1">Latitud</label>
          <input
            id="customer-lat"
            type="number"
            step="any"
            disabled={true}
            value={formData.location.lat}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                location: { ...prev.location, lat: parseFloat(e.target.value) }
              }))
            }
            className="w-full p-2 border border-border rounded text-xs"
            placeholder="-33.3"
            required
            />
        </div>
        <div className="flex-1 1/2">
          <label htmlFor="customer-lng" className="block text-xs mb-1">Longitud</label>
          <input
            disabled={true}
            id="customer-lng"
            type="number"
            step="any"
            value={formData.location.lng}
            onChange={e =>
              setFormData(prev => ({
                ...prev,
                location: { ...prev.location, lng: parseFloat(e.target.value) }
              }))
            }
            className="w-full p-2 border border-border rounded text-xs"
            placeholder="-66.3"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
