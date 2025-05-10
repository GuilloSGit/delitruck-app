'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, MoreVertical, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

// NavbarProps defines the properties for the Navbar component
interface NavbarProps {
  title: string
  backUrl?: string
}

// Navbar component with theme toggle button
export default function Navbar({ title, backUrl }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // This effect ensures the component is mounted before rendering theme icons (to avoid hydration mismatch)
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="bg-amber-500 text-white p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        {backUrl && (
          <Link href={backUrl} className="mr-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-amber-600">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        {/* Theme toggle button: switches between light and dark mode */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="text-white hover:bg-amber-600"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-white hover:bg-amber-600">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
