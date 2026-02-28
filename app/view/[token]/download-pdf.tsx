"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateInspectionPDF } from "@/lib/pdf"

interface PublicDownloadPDFProps {
  inspection: {
    id: string
    created_at: string
    odometer: number
    notes: string | null
    status: string
    vehicles: {
      year: number
      make: string
      model: string
      vin: string | null
      customer_name: string
    }
    inspection_results: {
      category: string
      item_name: string
      status: string
      measurement: string | null
      notes: string | null
    }[]
  }
}

export function PublicDownloadPDF({ inspection }: PublicDownloadPDFProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generateInspectionPDF(inspection)}
      className="font-bold"
    >
      <Download className="mr-2 h-4 w-4" /> PDF
    </Button>
  )
}
