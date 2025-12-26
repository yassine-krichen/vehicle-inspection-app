"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Copy, RefreshCw, Share2, Check, Globe } from "lucide-react"
import { toast } from "sonner"
import { togglePublishStatus, rotateShareToken } from "@/app/actions/share"

type ShareSettingsProps = {
  inspectionId: string
  shareToken: string
  isPublished: boolean
}

export function ShareSettings({ inspectionId, shareToken, isPublished: initialIsPublished }: ShareSettingsProps) {
  const [isPublished, setIsPublished] = useState(initialIsPublished)
  const [isToggling, setIsToggling] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/view/${shareToken}`

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
    try {
      const result = await rotateShareToken(inspectionId)
      if (result.success) {
        toast.success("New link generated! Old link is now invalid.")
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to generate new link")
      }
    } catch (err) {
      toast.error("Failed to generate new link")
    } finally {
      setIsRotating(false)
    }
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle>Share Settings</CardTitle>
        </div>
        <CardDescription>Control public access to this inspection report</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Publish Toggle */}
        <div className="flex items-center justify-between space-x-2 p-4 bg-slate-50 rounded-xl">
          <div className="space-y-0.5">
            <Label htmlFor="publish-toggle" className="text-base font-bold">
              Public Access
            </Label>
            <p className="text-sm text-muted-foreground">
              {isPublished ? "Report is visible to anyone with the link" : "Report is private"}
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
        <div className="space-y-2">
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
                className="pl-10 font-mono text-sm bg-white"
                disabled={!isPublished}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              disabled={!isPublished}
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {!isPublished && (
            <p className="text-xs text-muted-foreground">Enable public access to activate the link</p>
          )}
        </div>

        {/* Reset Link Button */}
        <div className="pt-4 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isRotating} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Link (Revoke Access)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset Share Link?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new link and permanently invalidate the old one. Anyone with the old link will
                  no longer be able to access this report. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRotateToken} className="bg-destructive text-destructive-foreground">
                  Reset Link
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
