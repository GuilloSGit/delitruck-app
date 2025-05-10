import Nav from "@/components/navbar"
import { CustomersTable } from "@/components/custom/customers-table"

export default function CustomersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background"> {/* Use bg-background for theme-aware background color */}
      <Nav title="Clientes" backUrl="/" />
      
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        <CustomersTable />
      </main>
    </div>
  )
}
