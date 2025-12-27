"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
import { Copy, RefreshCw, Check, Globe, Lock, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { togglePublishStatus, rotateShareToken } from "@/app/actions/share"
import { getPublicReportUrl } from "@/lib/url-utils"

type ShareModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  inspectionId: string
  shareToken: string
  isPublished: boolean
}

export function ShareModal({ open, onOpenChange, inspectionId, shareToken, isPublished: initialIsPublished }: ShareModalProps) {
  const [isPublished, setIsPublished] = useState(initialIsPublished)
  const [isToggling, setIsToggling] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const publicUrl = getPublicReportUrl(shareToken)

  const handleTogglePublish = async (checked: boolean) => {
    setIsToggling(true)
    try {
      const result = await togglePublishStatus(inspectionId, checked)
      if (result.success) {
        setIsPublished(checked)
        toast.success(checked ? "Report is now public!" : "Report is now private")
      } else {
        toast.error(result.error || "Failed to update publish status")
      }
    } catch (err) {
      toast.error("Failed to update publish status")
    } finally {
      setIsToggling(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success("Link copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const handleRotateToken = async () => {
    setIsRotating(true)
    setShowResetDialog(false)
    try {
      const result = await rotateShareToken(inspectionId)
      if (result.success) {
        toast.success("New link generated! Old link is now invalid.")
        setTimeout(() => window.location.reload(), 1000)
      } else {
        toast.error(result.error || "Failed to generate new link")
      }
    } catch (err) {
      toast.error("Failed to generate new link")
    } finally {
      setIsRotating(false)
    }
  }

  const handleOpenPublicLink = () => {
    window.open(publicUrl, "_blank")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Globe className="h-6 w-6 text-primary" />
              Share Inspection Report
            </DialogTitle>
            <DialogDescription>
              Control public access to this inspection report. Share the link with your customer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Publish Toggle */}
            <div className="flex items-center justify-between space-x-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-100">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {isPublished ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-400" />
                  )}
                  <Label htmlFor="publish-toggle" className="text-base font-bold cursor-pointer">
                    Public Access
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPublished ? "Anyone with the link can view this report" : "Report is private"}
                </p>
              </div>
              <Switch
                id="publish-toggle"
                checked={isPublished}
                onCheckedChange={handleTogglePublish}
                disabled={isToggling}
              />
            </div>

            {/* Share Link */}
            <div className="space-y-3">
              <Label htmlFor="share-link" className="text-sm font-bold">
                Public Link
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="share-link"
                    value={publicUrl}
                    readOnly
                    className="pl-10 font-mono text-xs bg-white"
                    disabled={!isPublished}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  disabled={!isPublished}
                  className="flex-shrink-0"
                  title="Copy link"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenPublicLink}
                  disabled={!isPublished}
                  className="flex-shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              {!isPublished && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Enable public access to activate the link
                </p>
              )}
            </div>

            {/* Security Section */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Security Options</h4>
                  <p className="text-xs text-muted-foreground">Revoke access if link is compromised</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                disabled={isRotating}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Link (Generate New URL)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Share Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a completely new link and permanently invalidate the old one. Anyone with the old link
              will no longer be able to access this report, even if it's published. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRotateToken} className="bg-destructive text-white hover:bg-destructive/80">
              Reset Link
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
