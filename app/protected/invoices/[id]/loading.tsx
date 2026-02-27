import { Loader2 } from "lucide-react"

export default function InvoiceDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Loading invoice...</p>
      </div>
    </div>
  )
}
