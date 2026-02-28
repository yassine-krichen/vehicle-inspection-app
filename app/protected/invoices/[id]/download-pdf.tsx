"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateInvoicePDF } from "@/lib/pdf"

interface DownloadInvoicePDFProps {
  invoice: {
    id: string
    invoice_number: string
    customer_name: string
    customer_email: string | null
    vehicle_info: string | null
    status: string
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    notes: string | null
    created_at: string
    sections: {
      id: string
      title: string
      invoice_items: {
        id: string
        description: string
        quantity: number
        unit_price: number
        amount: number
      }[]
    }[]
  }
}

export function DownloadInvoicePDF({ invoice }: DownloadInvoicePDFProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generateInvoicePDF(invoice)}
      className="font-bold"
    >
      <Download className="mr-2 h-4 w-4" /> PDF
    </Button>
  )
}
