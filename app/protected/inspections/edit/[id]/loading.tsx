import { Loader2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"

export default function EditInspectionLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <AppHeader title="Edit Inspection" />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Loading inspection...</p>
        </div>
      </div>
    </div>
  )
}
