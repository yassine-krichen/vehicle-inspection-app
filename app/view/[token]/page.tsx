import { getPublicInspection } from "@/app/actions/share"
import { InspectionReport } from "@/components/inspection-report"
import { AlertTriangle } from "lucide-react"
import { PublicPrintButton } from "./print-button"
import { PublicDownloadPDF } from "./download-pdf"
import { PRINT_STYLES } from "@/lib/print-styles"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params
  const result = await getPublicInspection(token)

  if (result.success && result.data) {
    const vehicle = result.data.vehicles
    return {
      title: `Inspection Report - ${vehicle.year} ${vehicle.make} ${vehicle.model} | Mechanic Pro`,
      description: `View your vehicle inspection report for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    }
  }
  
  return {
    title: 'Inspection Report | Mechanic Pro',
  }
}

export default async function PublicReportView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const result = await getPublicInspection(token)

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center space-y-6">
          <div className="bg-red-100 p-6 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase tracking-tight">Access Denied</h1>
            <p className="text-muted-foreground">
              This inspection report is not available. The link may have expired or been revoked.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const inspection = result.data

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Public Report</p>
              <p className="text-xs text-muted-foreground">Shared by your mechanic</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PublicDownloadPDF inspection={inspection} />
            <PublicPrintButton />
          </div>
        </div>

        {/* Report Content */}
        <InspectionReport inspection={inspection} showInternalNotes={false} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
    </div>
  )
}
