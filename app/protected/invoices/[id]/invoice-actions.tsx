"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Download, Printer, Send, CheckCircle2, RotateCcw, Trash2 } from "lucide-react"
import { deleteInvoice, updateInvoiceStatus } from "@/app/actions/invoices"
import { generateInvoicePDF } from "@/lib/pdf"
import { toast } from "sonner"

interface InvoiceActionsProps {
  invoiceId: string
  status: string
  invoice: {
    id: string
    invoice_number: string
    created_at: string
    customer_name: string
    customer_email: string | null
    vehicle_info: string | null
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    notes: string | null
    status: string
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

export function InvoiceActions({ invoiceId, status, invoice }: InvoiceActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteInvoice(invoiceId)

      if (result.success) {
        toast.success("Invoice deleted successfully")
        router.push("/protected/invoices")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete invoice")
      }
    } catch (err) {
      console.error("Error deleting invoice:", err)
      toast.error("Failed to delete invoice")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusUpdate = async (newStatus: "draft" | "sent" | "paid") => {
    try {
      setIsUpdating(true)
      const result = await updateInvoiceStatus(invoiceId, newStatus)

      if (result.success) {
        const labels = { draft: "Draft", sent: "Sent", paid: "Paid" }
        toast.success(`Invoice marked as ${labels[newStatus]}`)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch (err) {
      console.error("Error updating invoice status:", err)
      toast.error("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-none p-2">
          <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 px-3 py-2">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => generateInvoicePDF(invoice)}
            className="rounded-lg cursor-pointer py-2.5 px-3"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="font-bold text-sm">Download PDF</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => window.print()}
            className="rounded-lg cursor-pointer py-2.5 px-3"
          >
            <Printer className="mr-2 h-4 w-4" />
            <span className="font-bold text-sm">Print Invoice</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 px-3 py-2">
            Status
          </DropdownMenuLabel>
          {status !== "draft" && (
            <DropdownMenuItem
              onSelect={() => handleStatusUpdate("draft")}
              disabled={isUpdating}
              className="rounded-lg cursor-pointer py-2.5 px-3"
            >
              <RotateCcw className="mr-2 h-4 w-4 text-yellow-600" />
              <span className="font-bold text-sm">Back to Draft</span>
            </DropdownMenuItem>
          )}
          {status !== "sent" && (
            <DropdownMenuItem
              onSelect={() => handleStatusUpdate("sent")}
              disabled={isUpdating}
              className="rounded-lg cursor-pointer py-2.5 px-3"
            >
              <Send className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-bold text-sm">Mark as Sent</span>
            </DropdownMenuItem>
          )}
          {status !== "paid" && (
            <DropdownMenuItem
              onSelect={() => handleStatusUpdate("paid")}
              disabled={isUpdating}
              className="rounded-lg cursor-pointer py-2.5 px-3"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              <span className="font-bold text-sm">Mark as Paid</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteOpen(true)}
            className="rounded-lg cursor-pointer py-2.5 px-3 text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="font-bold text-sm">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight text-red-600">
              Delete Invoice?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This action cannot be undone. The invoice and all associated line items will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
