"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ShoppingBag, Users, BookOpen, PackageCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MobileNavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  
  return (
    <div className="flex fixed bottom-0 left-0 right-0 bg-amber-50 border-t border-stone-300 lg:hidden">
      <TooltipProvider>
        <div className="flex items-center w-full justify-between h-10">

        {!isHome && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/" className="flex flex-col items-center justify-center p-2">
                  <Home className="h-10 w-10 text-stone-800 pl-2" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-amber-50 text-stone-800">
                <p>Inicio</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/catalog" className="flex flex-col items-center justify-center p-2">
                <BookOpen className="h-10 w-10 text-stone-800 pl-2" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-stone-800">
              <p>Catálogo</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/customers" className="flex flex-col items-center justify-center p-2">
                <Users className="h-10 w-10 text-stone-800 pl-2" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-stone-800">
              <p>Clientes</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/inventory" className="flex flex-col items-center justify-center p-2">
                <PackageCheck className="h-10 w-10 text-stone-800 pl-2" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-stone-800">
              <p>Inventario</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/orders/new" className="flex flex-col items-center justify-center p-2">
                <PlusCircle className="h-10 w-10 text-stone-800 pl-2" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-stone-800">
              <p>Nueva Venta</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/orders" className="flex flex-col items-center justify-center p-2">
                <ShoppingBag className="h-10 w-10 text-stone-800 pl-2" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-50 text-stone-800">
              <p>Ventas</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
