"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export function PublicPrintButton() {
  return (
    <Button onClick={() => window.print()} className="font-bold">
      <Printer className="mr-2 h-4 w-4" /> Print Report
    </Button>
  )
}
