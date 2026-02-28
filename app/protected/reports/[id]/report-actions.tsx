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
import { MoreHorizontal, Share2, Globe, Download, Printer, Pencil, CheckCircle2, Trash2 } from "lucide-react"
import { deleteInspection, completeInspection } from "@/app/actions/inspections"
import { generateInspectionPDF } from "@/lib/pdf"
import { ShareModal } from "@/components/share-modal"
import { toast } from "sonner"

interface ReportActionsProps {
  reportId: string
  status: string
  shareToken: string
  isPublished: boolean
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

export function ReportActions({ reportId, status, shareToken, isPublished, inspection }: ReportActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)

  const isDraft = status === "draft"

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteInspection(reportId)

      if (result.success) {
        toast.success("Inspection deleted successfully")
        router.push("/protected/reports")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete inspection")
      }
    } catch (err) {
      console.error("Error deleting inspection:", err)
      toast.error("Failed to delete inspection")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleComplete = async () => {
    try {
      setIsCompleting(true)
      const result = await completeInspection(reportId)

      if (result.success) {
        toast.success("Inspection marked as completed!")
        setCompleteOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to complete inspection")
      }
    } catch (err) {
      console.error("Error completing inspection:", err)
      toast.error("Failed to complete inspection")
    } finally {
      setIsCompleting(false)
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
            onSelect={() => setShareOpen(true)}
            className="rounded-lg cursor-pointer py-2.5 px-3"
          >
            {isPublished ? (
              <Globe className="mr-2 h-4 w-4 text-green-600" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            <span className="font-bold text-sm">
              {isPublished ? "Manage Public Link" : "Share Report"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => generateInspectionPDF(inspection)}
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
            <span className="font-bold text-sm">Print Report</span>
          </DropdownMenuItem>

          {isDraft && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => router.push(`/protected/inspections/edit/${reportId}`)}
                className="rounded-lg cursor-pointer py-2.5 px-3"
              >
                <Pencil className="mr-2 h-4 w-4" />
                <span className="font-bold text-sm">Edit Inspection</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setCompleteOpen(true)}
                className="rounded-lg cursor-pointer py-2.5 px-3"
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                <span className="font-bold text-sm">Mark Complete</span>
              </DropdownMenuItem>
            </>
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

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        inspectionId={reportId}
        shareToken={shareToken}
        isPublished={isPublished}
      />

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight">
              Finalize Inspection?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This will mark the inspection as completed. Once completed, the report can no longer be edited.
              Make sure all inspection items are properly recorded before finalizing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-green-600 hover:bg-green-700 rounded-xl"
            >
              {isCompleting ? "Finalizing..." : "Yes, Finalize"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight text-red-600">
              Delete Inspection?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This action cannot be undone. The inspection report and all associated data will be permanently deleted.
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
