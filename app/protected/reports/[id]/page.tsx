import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PrintButton } from "./print-button"
import { ShareButton } from "./share-button"
import { InspectionReport } from "@/components/inspection-report"
import { PRINT_STYLES } from "@/lib/print-styles"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: inspection } = await supabase
    .from("inspections")
    .select(`
      *,
      vehicles (*)
    `)
    .eq("id", id)
    .single()

  if (inspection) {
    return {
      title: `Inspection Report - ${inspection.vehicles.year} ${inspection.vehicles.make} ${inspection.vehicles.model} | Mechanic Pro`,
    }
  }
  
  return {
    title: 'Inspection Report | Mechanic Pro',
  }
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: inspection, error } = await supabase
    .from("inspections")
    .select(`
      *,
      vehicles (*),
      inspection_results (*)
    `)
    .eq("id", id)
    .single()

  if (error || !inspection) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between print:hidden">
          <Button variant="ghost" asChild className="font-bold uppercase tracking-wider">
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" /> Dashboard
            </Link>
          </Button>
          <div className="flex gap-2">
            <ShareButton
              reportId={id}
              shareToken={inspection.share_token}
              isPublished={inspection.is_published || false}
            />
            <PrintButton />
          </div>
        </div>

        {/* Report Content */}
        <InspectionReport inspection={inspection} showInternalNotes={true} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />
    </div>
  )
}
