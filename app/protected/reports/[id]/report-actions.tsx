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
import { Pencil, Trash2, CheckCircle2, Loader2 } from "lucide-react"
import { deleteInspection, completeInspection } from "@/app/actions/inspections"
import { toast } from "sonner"

interface ReportActionsProps {
  reportId: string
  status: string
}

export function ReportActions({ reportId, status }: ReportActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)

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
    <div className="flex items-center gap-2">
      {/* Complete button — only for drafts */}
      {isDraft && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              disabled={isCompleting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Mark Complete
            </Button>
          </AlertDialogTrigger>
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
                className="bg-green-600 hover:bg-green-700 rounded-xl"
              >
                Yes, Finalize
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Edit button — only for drafts */}
      {isDraft && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/protected/inspections/edit/${reportId}`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}

      {/* Delete button — always available */}
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
