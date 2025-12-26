"use client"

import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

export function ShareButton({ reportId }: { reportId: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/protected/reports/${reportId}`
    
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Report link copied to clipboard!")
      
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Button variant="outline" className="bg-white" onClick={handleShare}>
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Share Report
        </>
      )}
    </Button>
  )
}
