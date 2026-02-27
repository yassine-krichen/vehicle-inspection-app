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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Trash2, Loader2, Send, CheckCircle2, ChevronDown, RotateCcw } from "lucide-react"
import { deleteInvoice, updateInvoiceStatus } from "@/app/actions/invoices"
import { toast } from "sonner"

interface InvoiceActionsProps {
  invoiceId: string
  status: string
}

export function InvoiceActions({ invoiceId, status }: InvoiceActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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
    <div className="flex items-center gap-2">
      {/* Status transition dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="mr-2 h-4 w-4" />
            )}
            Update Status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-none p-2">
          <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 px-3 py-2">
            Set Status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {status !== "draft" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("draft")}
              className="rounded-lg cursor-pointer py-2 px-3"
            >
              <RotateCcw className="mr-2 h-4 w-4 text-yellow-600" />
              <span className="font-bold text-sm">Back to Draft</span>
            </DropdownMenuItem>
          )}
          {status !== "sent" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("sent")}
              className="rounded-lg cursor-pointer py-2 px-3"
            >
              <Send className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-bold text-sm">Mark as Sent</span>
            </DropdownMenuItem>
          )}
          {status !== "paid" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("paid")}
              className="rounded-lg cursor-pointer py-2 px-3"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
              <span className="font-bold text-sm">Mark as Paid</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isDeleting}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </AlertDialogTrigger>
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
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
