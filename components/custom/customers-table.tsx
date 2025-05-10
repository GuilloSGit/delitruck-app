'use client'

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCustomers, Customer } from "@/hooks/use-customers"
import { CustomerForm } from "./customer-form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { Pencil, Search, Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { DialogDescription } from "@radix-ui/react-dialog"

export function CustomersTable() {
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  const filteredCustomers = useMemo(() => {
    if (!debouncedSearch) return customers

    const searchLower = debouncedSearch.toLowerCase()
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchLower) ||
      (customer.email?.toLowerCase() || "").includes(searchLower) ||
      (customer.phone?.toLowerCase() || "").includes(searchLower) ||
      (customer.address?.toLowerCase() || "").includes(searchLower)
    )
  }, [customers, debouncedSearch])

  const handleCreateSubmit = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    await createCustomer(data)
    setIsCreateDialogOpen(false)
  }

  const handleEditSubmit = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, data)
      setEditingCustomer(null)
    }
  }

  const handleDelete = async () => {
    if (deletingCustomer) {
      await deleteCustomer(deletingCustomer.id)
      setDeletingCustomer(null)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Cargando clientes...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none">
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, email, teléfono o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Nuevo Cliente</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogDescription>Formulario de nuevo cliente</DialogDescription>
              <DialogHeader>
                <DialogTitle>Nuevo Cliente</DialogTitle>
              </DialogHeader>
              <CustomerForm
                onSubmit={handleCreateSubmit}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <h2 className="text-2xl font-bold my-4">Clientes</h2>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {/* Versión Desktop */}
        <div className="hidden md:block h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchQuery !== debouncedSearch ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-gray-600 font-semibold whitespace-nowrap text-center animate-pulse">
                    Lo estoy buscando...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-gray-600 font-semibold whitespace-nowrap text-center">
                    {searchQuery ? "No se encontraron clientes" : "No hay clientes registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="text-gray-600 font-semibold whitespace-nowrap">{customer.name}</TableCell>
                    <TableCell className="text-gray-600 whitespace-nowrap">{customer.email || '-'}</TableCell>
                    <TableCell className="text-gray-600 whitespace-nowrap">{customer.phone || '-'}</TableCell>
                    <TableCell className="text-gray-600 whitespace-nowrap">{customer.address || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog open={editingCustomer?.id === customer.id} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingCustomer(customer)}>
                              <Pencil className="mr-2 h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogDescription>Formulario de edición de cliente</DialogDescription>
                            <DialogHeader>
                              <DialogTitle>Editar Cliente</DialogTitle>
                            </DialogHeader>
                            <CustomerForm
                              initialData={customer}
                              onSubmit={handleEditSubmit}
                              onCancel={() => setEditingCustomer(null)}
                            />
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingCustomer(customer)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Versión Mobile */}
        <div className="block md:hidden space-y-4 pb-4">
          {searchQuery !== debouncedSearch ? (
            <div className="text-gray-600 font-semibold text-center animate-pulse p-4">
              Lo estoy buscando, bancá man...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-gray-600 font-semibold text-center p-4">
              {searchQuery ? "No se encontraron clientes" : "No hay clientes registrados"}
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div>
                  <div className="text-lg font-semibold text-gray-600">{customer.name}</div>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center text-gray-600">
                      <span className="w-24 text-sm">Email:</span>
                      <span>{customer.email || '-'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-24 text-sm">Teléfono:</span>
                      <span>{customer.phone || '-'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="w-24 text-sm">Dirección:</span>
                      <span>{customer.address || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Dialog open={editingCustomer?.id === customer.id} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingCustomer(customer)}>
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                      </DialogHeader>
                      <CustomerForm
                        initialData={customer}
                        onSubmit={handleEditSubmit}
                        onCancel={() => setEditingCustomer(null)}
                      />
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingCustomer(customer)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente
              {deletingCustomer && ` "${deletingCustomer.name}"`} y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
