"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Globe } from "lucide-react"
import { ShareModal } from "@/components/share-modal"

type ShareButtonProps = {
  reportId: string
  shareToken: string
  isPublished: boolean
}

export function ShareButton({ reportId, shareToken, isPublished }: ShareButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant={isPublished ? "default" : "outline"}
        className={isPublished ? "bg-green-600 hover:bg-green-700" : "bg-white"}
        onClick={() => setOpen(true)}
      >
        {isPublished ? (
          <>
            <Globe className="mr-2 h-4 w-4" />
            Public Link Active
          </>
        ) : (
          <>
            <Share2 className="mr-2 h-4 w-4" />
            Share Report
          </>
        )}
      </Button>

      <ShareModal
        open={open}
        onOpenChange={setOpen}
        inspectionId={reportId}
        shareToken={shareToken}
        isPublished={isPublished}
      />
    </>
  )
}
